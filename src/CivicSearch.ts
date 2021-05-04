import axios from "axios";
import {State} from "./State";

/**
 * A class that leverages the Google Civic Information API to look up state governors by their state's abbreviation and
 * return the list sorted by name of the state or the governor's last name.
 */
export default class CivicSearch {

    apiKey: string

    /**
     * Create an instance of the CivicSearch class, must provide a valid api key to use the Google Civic Information API
     * @param apiKey - String containing the api key
     */
    constructor(apiKey: string) {
        this.apiKey = apiKey
    }

    /**
     * Transform an array of state abbreviations into {@link State | State enums}. If an unknown abbreviation is encountered it will be
     * logged to stderr and skipped.
     * @param states - Array of two letter state abbreviations
     * @returns List of {@link State | States} that were found based on the input
     */
    public getStatesFromAbbr(states: string[]): State[]{
        return states.map((s) => {
            let state = State[s]
            if (state == undefined) {
                console.error(`Unknown state abbreviation: ${s}`)
            }
            return state
        }).filter((s) => {return s != undefined})
    }

    /**
     * Given a list of state abbreviations, use the Civil Information API to determine the governor of each state and
     * return the array sorted by last name of the governor, `name`, or state name, `state`
     * @param states - Array of two letter state abbreviations
     * @param sort - Desired order of the output list, `state` and `name` are valid options
     * @returns Array of governors of the provided `states` `sort`ed by specified field
     */
    public async listGovernors(states: string[], sort: string='state'): Promise<string[]> {
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

    /**
     * Find the governor of a {@link State | State} using thr Civic Information API. The API if called with parameters
     * to filter just the governor of the state and this will return rejection if the number of officials found is not
     * exactly 1
     * @param state - {@link State | State} to find the governor of
     * @returns The full name of the governor of the `state`
     */
    public async findGovernor(state: State): Promise<string> {
        let response = await axios.get(`https://civicinfo.googleapis.com/civicinfo/v2/representatives?address=${state}&levels=administrativeArea1&roles=headOfGovernment&key=${this.apiKey}`)
        if (response.data['officials'].length != 1) {
            return Promise.reject(new Error(`Unexpected number of returned officials: ${response.data['officials'].length}`))
        } else {
            return response.data['officials'][0]['name']
        }
    }

    /**
     * Compare to name strings based on the last name. This is assumed to be the string after the last whitespace in
     * the name.
     * @param nameA - Name of the first person to compare last names
     * @param nameB - Name of the first person to compare last names
     * @returns 1 if `nameA` is before `nameB`, 0 if the last names are the same, -1 if `nameB` is before `nameA`
     */
    public compareLastNames(nameA: string, nameB: string): number {
        let namesA = nameA.split(/\s+/)
        let namesB = nameB.split(/\s+/)
        let lastA = namesA[namesA.length - 1]
        let lastB = namesB[namesB.length - 1]
        return lastA.localeCompare(lastB)
    }
}
