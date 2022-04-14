[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

## Eleven Anonymizer
This Anonymizer program is based on [DivanteLtd/Anonymizer](https://github.com/DivanteLtd/anonymizer).

This version is written in [Typescript](https://www.typescriptlang.org/) and [Deno](https://deno.land) and can be build to an executable.

### Usage
Keep in mind that this tool will do actions on the database. Please make sure you are testing this first before committing any changes to the database.
There is no warranty for using this script, use at your own risk.

### Why make this?
While the original Anonymizer by DivanteLtd works fine it needs much more work to be installed and implemented on our computers/servers.
We wanted the functionality used in that version, but be able to just call the Anonymizer from anywhere and point to the needed configurations.

Also by making most of the configurations as command line arguments we are able to use the same Anonymizer and run it on a DTAP environment without creating multiple configuration files.

### Why Typescript and Deno
Typescript is something we are more comfortable with in terms of implementation.
As a trial we wanted to make an executable CLI script. This is something that Typescript + Node could give us. Initially this project was made using Typescript + Node but after a while we choose Deno as it was a much better use case for this project.
The benefits of using Deno over Node is that Deno is secure by default. Things like File access and Network access can be enabled but are disabled by default. And even if enabled it can be configured to only allow specific locations or hosts/ip/ports.

Since this scripts goal is to anonymize databases, security should be one of the main focuses.

### Making sure the integrity of the imports are correct
Deno has a way to make sure that the imported packages can't just update their code on the server without you automatically retrieving this code.
That's why we also have a `lock.json` in the project.

When this project is opened for the first time on a new computer please run:

`deno cache --lock=lock.json src/anonymizer.ts`

This will make sure that the correct versions are downloaded into the computers cache where each import is integrity checked.

### How to build to an executable
To compile the executable the following arguments need to be set during compile otherwise the executable will not be able to run correctly

```deno compile --allow-read --allow-net --allow-env=ANONYMIZER_LOCAL_DATABASE,ANONYMIZER_LOCAL_USERNAME,ANONYMIZER_LOCAL_PASSWORD,ANONYMIZER_CONFIG,FAKER_LOCALE --output=build/anonymizer src/anonymizer.ts```

It is recommended to limit the `--allow` flags like for example `--allow-read=/var/www` and `--allow-net=127.0.0.1`.

### How to use
Using the executable can be done as follows

```ANONYMIZER_LOCAL_DATABASE=<db_name> ANONYMIZER_LOCAL_USERNAME=<db_user> ANONYMIZER_LOCAL_PASSWORD=<db_pass> ANONYMIZER_CONFIG=<path/to/json/config/file> FAKER_LOCALE=<isolang> anonymizer```

### Use the example to test
You can use the provided `example.sql` and `example.json` to verify the tool

1. Use the `example.sql` to create an `example` database with a `dummy_data` table and some entries
2. Create an `example` user and password and only grant it permissions to the `example` database.
3. Then run the Anonymizer using: `ANONYMIZER_LOCAL_DATABASE=example ANONYMIZER_LOCAL_USERNAME=example ANONYMIZER_LOCAL_PASSWORD=example ANONYMIZER_CONFIG=<path/to/example.json> FAKER_LOCALE=en anonymizer`

### Unit tests
You can also run unit test by running the following command `deno test`

You can also generate a coverage report by running the following commands

`deno test --allow-env --coverage=cov_profile`

`deno coverage cov_profile --lcov > cov_profile/cov_profile.lcov`

If you have the `genhtml` package you can generate a html report of the coverage

`genhtml -o cov_profile/html cov_profile/cov_profile.lcov`
