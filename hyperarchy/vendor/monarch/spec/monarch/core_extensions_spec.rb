require File.expand_path("#{File.dirname(__FILE__)}/../monarch_spec_helper")

describe "Class.thread_local_accessor" do
  manually_manage_identity_map # otherwise other assignments to thread local interfere with mock expectations

  it "creates a method that writes to thread local storage, using the current object hash as a disambiguating key" do
    test_class = Class.new
    test_class.thread_local_accessor(:foo)
    test_instance = test_class.new

    mock.proxy(Thread.current)["foo_#{test_instance.hash}"] = "bar"
    test_instance.foo = "bar"

    mock.proxy(Thread.current)["foo_#{test_instance.hash}"]
    test_instance.foo.should == "bar"
  end
end