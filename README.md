# Hyperarchy

Hyperarchy is a collaborative decision-making tool based on ranked-pairs voting.
This version is a stripped-down prototype designed for internal use at GitHub.
It's licensed under the AGPL, and I will be developing it gradually based on our
needs and experience within GitHub over the coming months. Hyperarchy is a Rails
app and is designed for easy deployment to Heroku. It currently authenticates
against GitHub Oauth, requiring users to be a member of a GitHub team which is
specified as an environment variable. This authentication scheme is based on
OmniAuth, and should be straightforward to replace with a different
authentication approach with a bit of hacking.

## Environment Variables

Hyperarchy uses the [dotenv](https://github.com/bkeepers/dotenv) Gem to load
various environment variables from a `.env` file located in the application's
root in development. There's a .env.example file which lists various environment
variables you'll need to run the application. Run `cp .env.example .env` and
then edit the file to fill in relevant values for your variables.

* `RAILS_SECRET_TOKEN`: This is any random string, 128 characters long. Rails uses
  it as a unique identifier of your app for security purposes.

* `PUSHER_URL`: Hyperarchy uses a service called [Pusher](http://pusher.com) to
  send real-time updates to clients. You'll need to setup an account with them
  and fill in your key, secret, and app-number into the template from the
  exmaple.

* `GITHUB_KEY`, `GITHUB_SECRET`, and `GITHUB_TEAM_ID`: Hyperarchy currently
  requires users to be members of a specific GitHub team, and it uses the
  OmniAuth gem to implement GitHub authentication. It should be fairly
  simple to change the authentication scheme by changing the OmniAuth strategy
  as well as some changes in the sessions controller and user model  To work
  with the existing authentication, you need to setup Hyperarchy in the 
  [applications section](https://github.com/settings/applications) of your
  GitHub account. Create two applications, one for local development with a URL
  matching the URL you use to access the server on your machine (maybe
  localhost), and one for production. Don't try to use the same application for
  both. You'll also need to specify the GitHub team id that users are required
  to be a member of.  authenticates needs to be a member of. More information
  on GitHub teams can be found [here](http://developer.github.com/v3/orgs/teams/).
  I expect a lot of people will want a different authentication rule, but this
  is what we needed at GitHub so that's what there is for now.

* REDISTOGO_URL: Hyperarchy requires a Redis server for synchronization
  purposes. You can install redis with homebrew: `brew install redis` and follow
  the instructions to start the server on your machine.

## Postgres
You'll need to run a database server on your local system for Hyperarchy to
store its data. If you're on a Mac, you can install it with
[Homebrew](http://mxcl.github.com/homebrew/):

```
brew install postgres
```

Then follow the instructions (available via `brew info postgres`) to create the
initial database and start the server. You'll need to edit `config/database.yml`
and change the username from "nathansobo" to your username or a valid account
for your Postgres server. You can create a new Postgres user with the
`createuser` command.

## To be continued...
