require 'capistrano/ext/multistage'

set :application, "hyperarchy"
set :repository,  "git@github.com:nathansobo/hyperarchy.git"
set :scm, :git
set :user, :root

ssh_options[:keys] = [File.expand_path('config/provision/keys/id_rsa')]