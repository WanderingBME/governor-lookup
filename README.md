## Governor Lookup

This is a Node.js project with a command line interface to look up the governor of one or more states given the state 
abbreviation and return the results sorted by either state name or last name of the governor of the state.

### Usage
Install project dependencies:

```npm install```

Compile Typescript:

```tsc```

The project requires an API key from Google to access the Civic Information API. Once obtained this should be set as an 
environmental variables `API_KEY` for the project to use when executing.

To use the search, execute the main script. This script expects at least two parameters. The first parameter is the 
sort method options are `name` to sort by governor last name and `state` to sort by full state name, if the method is 
not recognized the sort will default to `state`. The second parameter is a two letter state abbreviation. Any number of 
states can be added as additional parameters. If a state abbreviation is not recognized the other states specified will 
be output and those skipped.

```node src/main.js name GA FL ME```

## Future
### Scheduling and Storage
If this project were to be adapted to run on a schedule and results saved into a data warehouse the process could be 
scheduled as is with a preferred framework (Jenkins, cron, etc.) as a standalone application, or with a Node.js specific 
framework (agenda, cron-jobs-node, or any other). This task could be scheduled as a single execution but if expanded 
could use the parameterization to chunk the executions to distribute the requests.

For persistence a data model for the results should be added to the project with all desired information from the API, 
the current implementation only considers full names as a single string. With this model a storage system such as 
MySQL, MongoDB, or any other could be utilized to persist results. Ideally the storage would include timestamp of data 
acquisition as well as all other metadata provided by the API to include as much information for consumers as possible. 

### Parameterization
The current implementation is extremely simple and if filtering parameterization would be added should move away from command 
line and into a package for dependency management or a standalone service such as a REST API.

A package could include multiple functions for different actions, but a parameterized function could simply add to the 
existing signature with default values to not impact existing behavior without these parameters. Adding additional
functions for new logic would be recommended.

```listGovernors(states: string[], sort: string='state', hasTwitter: boolean=true)```

A REST API for this should include an endpoint with a `GET` request and use query parameters for adding the filters 
with the same idea of default values to not impact existing functionality. Or if functionality must be changed 
versioning the API to note so.

```https://host/v1/lookups/governor?states=GA,FL,ME&sort=name&hasTwitter=true```
