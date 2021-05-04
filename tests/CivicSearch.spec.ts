import {expect} from 'chai'
import * as moxios from 'moxios'
import CivicSearch from '../src/CivicSearch'
import {State} from "../src/State";

describe('CivicSearch', function () {

    let searcher: CivicSearch

    beforeEach(() => {
        moxios.install()
        searcher = new CivicSearch('not a key')
    });

    afterEach(() => {
        moxios.uninstall()
    });

    describe('constructor', () => {
        it('should set the instance key when constructed', () => {
            searcher = new CivicSearch('A different key')
            expect(searcher.apiKey).to.eq('A different key')
        })
    })

    describe('getStatesFromAbbr', () => {
        it('should correctly identify states', () => {
            let result = searcher.getStatesFromAbbr(['ME', 'GA'])
            expect(result).to.have.members([State.GA, State.ME])
        })

        it('should filter out unknown states', () => {
            let result = searcher.getStatesFromAbbr(['ME', 'GA', 'ZZ'])
            expect(result).to.have.members([State.GA, State.ME])
        })
    })

    describe('listGovernors', () => {
        it('find governors and sort by state name default', async () => {
            searcher.getStatesFromAbbr = () => {return [State.AR, State.AZ]}
            searcher.findGovernor = async (input) => {return input}
            let result = await searcher.listGovernors([], null)
            expect(result).to.eql(['Arizona', 'Arkansas']);
        })

        it('find governors and sort by state name', async () => {
            searcher.getStatesFromAbbr = () => {return [State.AR, State.AZ]}
            searcher.findGovernor = async (input) => {return input}
            let result = await searcher.listGovernors([], 'state')
            expect(result).to.eql(['Arizona', 'Arkansas']);
        })

        it('find governors and sort by governor name', async () => {
            searcher.getStatesFromAbbr = () => {return [State.AR, State.AZ]}
            searcher.findGovernor = async (input) => {return input}
            searcher.compareLastNames = () => {return 1}
            let result = await searcher.listGovernors([], 'name')
            expect(result).to.eql(['Arkansas', 'Arizona']);
        })

        it('filter governors where rest call failed', async () => {
            searcher.getStatesFromAbbr = () => {return [State.AR, State.AZ]}
            searcher.findGovernor = async () => {return Promise.reject()}
            let result = await searcher.listGovernors([], 'name')
            expect(result).to.eql([]);
        })
    })

    describe('findGovernor', () => {
        it('should return a success when 1 official is returned', async () => {
            moxios.wait(() => {
                const request = moxios.requests.mostRecent()
                request.respondWith({status: 200, response: {officials: [{name: 'Test governor'}]}})
            })
            const result = await searcher.findGovernor(State.GA)
            expect(result).to.eq('Test governor')
        })

        it('should return a rejection when 0 officials are returned', async () => {
            moxios.wait(() => {
                const request = moxios.requests.mostRecent()
                request.respondWith({status: 200, response: {officials: []}})
            })
            const result = await searcher.findGovernor(State.GA).catch((e) => {
                expect(e.message).to.eq('Unexpected number of returned officials: 0')
            })
            expect(result).to.be.undefined
        })

        it('should return a rejection when 2 officials are returned', async () => {
            moxios.wait(() => {
                const request = moxios.requests.mostRecent()
                request.respondWith({status: 200, response: {officials: [{}, {}]}})
            })
            const result = await searcher.findGovernor(State.GA).catch((e) => {
                expect(e.message).to.eq('Unexpected number of returned officials: 2')
            })
            expect(result).to.be.undefined
        })
    })

    describe('compareLastNames', () => {
        it('should sort by last string when splitting by space', () => {
            expect(searcher.compareLastNames('a b', 'z y  a')).to.eq(1)
            expect(searcher.compareLastNames('a b', 'z y')).to.eq(-1)
            expect(searcher.compareLastNames('a b', 'b')).to.eq(0)
        })
    })
})
