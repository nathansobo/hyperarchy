
Spec::Runner.configure do |config|
  def purge_example_domain_model
    Object.instance_eval do
      remove_const(:Blog) if defined? Blog
      remove_const(:BlogPost) if defined? BlogPost
      remove_const(:User) if defined? User
      remove_const(:UserRepository) if defined? UserRepository
      remove_const(:GuidRecord) if defined? GuidRecord
    end
    Monarch::Model::Repository.reset
  end

  def load_example_domain_model
    dir = File.expand_path(File.dirname(__FILE__))
    load "#{dir}/example_domain_model/blog.rb"
    load "#{dir}/example_domain_model/blog_post.rb"
    load "#{dir}/example_domain_model/user.rb"
    load "#{dir}/example_domain_model/guid_record.rb"
    load "#{dir}/example_domain_model/user_repository.rb"
    Monarch::Model::Repository.create_schema
  end

  config.before do
    purge_example_domain_model
    load_example_domain_model
  end

  config.after do
    purge_example_domain_model
  end
end






