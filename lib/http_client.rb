module HttpClient
  def post(url, options={})
    Typhoeus::Request.post(url, options)
  end

  def delete(url, options={})
    Typhoeus::Request.delete(url, options)
  end
end
