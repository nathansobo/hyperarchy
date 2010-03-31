Origin.connection = Sequel.mysql('hyperarchy_test', :user => 'root', :password => 'password')
Model::convert_strings_to_keys = true