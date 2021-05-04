import CivicSearch from './CivicSearch';

(async () => {
    let searcher = new CivicSearch(process.env.API_KEY)
    let sort = process.argv[2]
    let requestStates = process.argv.slice(3)
    console.log(await searcher.listGovernors(requestStates, sort))
})()