Origin.connection = Sequel.sqlite
Model::Repository.create_schema
Model::convert_strings_to_keys = true