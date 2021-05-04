import axios from "axios";
import {State} from "./State";

export default class CivicSearch {

    apiKey: string

    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    public getStatesFromAbbr(states: string[]): State[]{
        return states.map((s) => {
            let state = State[s]
            if (state == undefined) {
                console.error(`Unknown state abbreviation: ${s}`)
            }
            return state
        }).filter((s) => {return s != undefined})
    }

    public async listGovernors(states: string[], sort: string): Promise<string[]> {
        if (['name', 'state'].indexOf(sort) == -1) {
            console.error(`Unknown sorting option: {${sort}}`)
            console.error(`Sort will be by state name`)
        }
        let governors = []
        for (const s of this.getStatesFromAbbr(states).sort()) {
            await this.findGovernor(s).then((result) => {
                governors.push(result)
            }).catch((e) => {
                console.error(e)
            })
        }

        if (sort === 'name') {
            return governors.sort(this.compareLastNames)
        }
        return governors
    }

    public async findGovernor(state: State): Promise<string> {
        let response = await axios.get(`https://civicinfo.googleapis.com/civicinfo/v2/representatives?address=${state}&levels=administrativeArea1&roles=headOfGovernment&key=${this.apiKey}`)
        if (response.data['officials'].length != 1) {
            return Promise.reject(new Error(`Unexpected number of returned officials: ${response.data['officials'].length}`))
        } else {
            return response.data['officials'][0]['name']
        }
    }

    public compareLastNames(nameA: string, nameB: string): number {
        let namesA = nameA.split(/\s+/)
        let namesB = nameB.split(/\s+/)
        let lastA = namesA[namesA.length - 1]
        let lastB = namesB[namesB.length - 1]
        return lastA.localeCompare(lastB)
    }
}
