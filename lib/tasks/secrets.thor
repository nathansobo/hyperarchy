require File.expand_path('../thor_helper', __FILE__)

class Secrets < Thor
  desc 'unpack [password]', "Decrypt and unpack the secrets file"
  def unpack(password=nil)
    cd_to_rails_root
    system "openssl enc -aes-256-cbc -d -in config/secrets.tar.enc -out config/secrets.tar#{" -pass pass:#{password}" if password}"
    system "tar -xf config/secrets.tar"
  end

  desc 'pack', "Pack and encrypt the secrets file"
  def pack
    cd_to_rails_root
    system "tar -f config/secrets.tar -c config/smtp_settings config/api_keys.yml keys/servers keys/hyperarchy.key"
    system "openssl enc -aes-256-cbc -e -in config/secrets.tar -out config/secrets.tar.enc"
  end

  protected

  def cd_to_rails_root
    Dir.chdir File.expand_path("../../..", __FILE__)
  end
end
