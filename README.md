# Hyperarchy

Hyperarchy is a collaborative decision-making tool based on ranked-pairs voting.
This version is a stripped-down prototype designed for internal use at GitHub.
It's licensed under the AGPL, and I will be developing it gradually based on our
needs and experience within GitHub over the coming months.

![Questions List](http://f.cl.ly/items/1K0h2E101Q1X1C3z0n3J/Screen%20Shot%202012-12-06%20at%208.18.33%20PM.png)
![Question Detail](http://f.cl.ly/items/1T162d3D2n2x1d2C3511/Screen%20Shot%202012-12-06%20at%208.19.32%20PM.png)

Hyperarchy is a Rails app and is designed for easy deployment to Heroku.
With exceptions noted below getting Hyperarchy running should be similar to any
standard Rails application that you'd put on Heroku. In addition to the typical
Postgres database requirement, Hyperarchy also requires Redis and a real-time
messaging service called [Pusher](http://pusher.com). Configuring the application
will require changes to environment variables in a `.env` file and entries in
`database.yml`.

## Environment Variables

Hyperarchy loads various environment variables from a `.env` file located in the
application's root in development. There's a .env.example file which lists various
environment variables you'll need to run the application. Run `cp .env.example .env`
and then edit the file to fill in relevant values for your variables.

* `RAILS_SECRET_TOKEN`: This is any random string, 128 characters long. Rails uses
  it as a unique identifier of your app for security purposes.

* `PUSHER_URL`: Hyperarchy uses a service called [Pusher](http://pusher.com) to
  send real-time updates to clients. You'll need to setup an account with them,
  then synthesize this URL based on the the API credentials. Don't follow the
  instructions on their site, just find the page with a listing like the following
  and use these values to construct a URL based on the example:

  Pusher.app_id = 'xxxx'
  Pusher.key    = 'xxxxxxxxxxxxxxxxxxxx'
  Pusher.secret = 'xxxxxxxxxxxxxxxxxxxx'

* `PUSHER_CHANNEL`: This can be any name. Different environments should have
  different channel names, like "hyperarchy_production", "hyperarchy_staging",
  and "hyperarchy_development" so that messages stay separate.

* REDISTOGO_URL: Hyperarchy requires a Redis server for synchronization
  purposes. You can install redis with homebrew: `brew install redis` and follow
  the instructions to start the server on your machine. Make sure the URL
  in the file matches your server's hostname and port.

## Database.yml

Like most Rails apps, Hyperarchy depends on a relational database. Because it's
designed for Heroku deployment, it uses PostgreSQL. If you're on a Mac, you can
install Postgres with [Homebrew](http://mxcl.github.com/homebrew/):

```
brew install postgres
```

Then follow the instructions (available via `brew info postgres`) to create the
initial database and start the server. You'll need to run `cp
config/database.yml.example config/database.yml` and change the credentials for
your Postgres server. You can create a new Postgres user with the `createuser`
command.

## Installing Ruby and Gems

* Install Ruby 1.9

* Install Bundler: You may need to prefix this command with `sudo` depending on
  your Ruby installation.

  ```
  gem install bundler
  ```

* Install Hyperarchy's gems using Bundler:

  ```
  bundle install
  ```

## Creating and Migrating The Database

Make sure your database server is started, then run `rake db:create db:migrate`
to create and migrate the database. If you have problems here, it may be because
you didn't change `database.yml` to connect to your database.


## Running

Finally, should should be able to start the application:

```
rails server
```

## Rough edges around authentication

The basic authentication built into Hyperarchy is still pretty rough. We use
a GitHub-specific scheme at GitHub, but I wanted to add something in there to
make it easy to sign up and get started. Authentication is based on the
[omniauth-identity](https://github.com/intridea/omniauth-identity) strategy, so
reading its documentation may be a jumping off point for customizing the look of
the login screen.

Login errors don't display due to my custom ORM needing to implement ActiveModel.
This will be fixed in a future revision.

## Deployment

The application is designed to be deployed to Heroku. You'll need to enable the
Pusher and Redis To Go addons on your application in addition to the standard
Postgres database. Also make sure you use `heroku config:set` to assign the
RAILS_SECRET and the PUSHER_CHANNEL on your application. Then push and migrate
the databases. There's a `deploy` rake task to handle putting up a maintenance
page when you need to push app changes that are bundled with migrations, but you'll
need to change the names of the heroku applications mentioned in the `--app` section.
