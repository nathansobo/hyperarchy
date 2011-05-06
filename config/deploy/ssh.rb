ssh_options[:keys] = [File.expand_path('config/provision/keys/id_rsa')]
ssh_options[:forward_agent] = true

task :add_ssh_agent do
  unless run_locally("ssh-add -l") =~ %r{config/provision/keys/id_rsa}
    run_locally("ssh-add #{ssh_options[:keys].first}")
  end
end
