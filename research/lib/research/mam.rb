class Mam
  def initialize
    @rankings = []
  end

  # maybe pass in an array of numbers representing a given ranking and store it somehow?
  def add_vote(ranking)
    rankings.push(ranking) # push the new ranking onto an array of rankings
  end

  # this method would run the algorithm against the given rankings
  def result
    
  end
end