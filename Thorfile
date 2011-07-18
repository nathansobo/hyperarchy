class Blog < Thor
  desc "publish", "generate and rsync the blog to production"
  def publish
    generate
    system "rsync --dirs -ave ssh root@demo.hyperarchy.com:/blog ."
  end

  desc "generate", "generate the stylesheets with compass and then the blog with jekyll in the _site directory"
  def generate
    system! "bundle exec compass compile"
    system! "bundle exec jekyll"
  end

  desc "develop", "watch the sass and run the jekyll server with foreman"
  def develop
    system "bundle exec foreman start"
  end

  protected

  def system!(command)
    raise "command failed: #{command}" unless system(command)
  end
end