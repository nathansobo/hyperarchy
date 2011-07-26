require File.expand_path('../thor_helper', __FILE__)

class Blast < Thor



  desc "blast [template_name]", "send the blast from the template with the given name"
  def blast(template_name=nil)
    require_environment
    require 'pony'
    require 'erb'
    require 'rdiscount'

    via_options = YAML.load_file(Rails.root.join('config/smtp_settings/production.yml')).symbolize_keys


    template_path = Rails.root.join("doc/blasts/#{template_name}.md.erb")
    template_content = File.read(template_path)

    User.each do |user|
      markdown = ERB.new(template_content).result(binding)
      html = RDiscount.new(markdown).to_html
      puts html
    end
u
    p via_options
  end

end