require File.expand_path('../thor_helper', __FILE__)

class Secrets < Thor
  desc 'unpack', "Decrypt and unpack the secrets file"
  def unpack
    cd_to_rails_root
    system "openssl enc -aes-256-cbc -d -in config/secrets.tar.enc -out config/secrets.tar"
    system "tar -xf config/secrets.tar"
  end

  desc 'pack', "Pack and encrypt the secrets file"
  def pack
    cd_to_rails_root
    system "tar -f config/secrets.tar -c config/passwords.yml config/smtp_settings keys/servers"
    system "openssl enc -aes-256-cbc -e -in config/secrets.tar -out config/secrets.tar.enc"
  end

  protected

  def cd_to_rails_root
    Dir.chdir File.expand_path("../../..", __FILE__)
  end
end
