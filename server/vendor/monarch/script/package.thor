dir = File.dirname(__FILE__)
require "rubygems"
require "thor"
require "#{dir}/../server/lib/monarch"

class Package < Thor
  desc "all", "Create a concatenated js file of the whole framework"
  def all
    concatenate(['monarch.js'], 'monarch.js')
  end

  desc "all_min", "Create a minified js file of the whole framework"
  def all_min
    concatenate(['monarch.js'], 'monarch.min.js')
  end

  desc "view", "Create a concatenated js file of view-related code"
  def view
    concatenate(['monarch_view.js'], 'monarch_view.js')
  end

  desc "view_min", "Create a minified js file of view-related code"
  def view_min
    minify(['monarch_view.js'], 'monarch_view.min.js')
  end

  no_tasks do
    def pkg_dir
      "#{script_dir}/../pkg"
    end

    def script_dir
      File.dirname(__FILE__)
    end

    def create_pkg_dir
      system "mkdir #{pkg_dir}" unless File.exist?(pkg_dir)
    end

    def concatenate(source_file_paths, outfile_name)
      create_pkg_dir
      paths_of_files_to_concatenate = ::Util::AssetManager.instance.physical_dependency_paths_from_load_path(source_file_paths)
      system "cat #{paths_of_files_to_concatenate.join(' ')} | grep -v '^//=' > #{pkg_dir}/#{outfile_name}"
    end

    def minify(source_file_paths, outfile_name)
      concatenate(source_file_paths, outfile_name)
      system "java -jar #{script_dir}/yuicompressor-2.4.2.jar --type js -o #{pkg_dir}/#{outfile_name} #{pkg_dir}/#{outfile_name}"
    end
  end
end
