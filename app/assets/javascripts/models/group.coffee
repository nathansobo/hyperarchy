class Models.Group extends Monarch.Record
  @tableName = 'Group'
  @extended(this)

  @columns
    name: 'string'

  @hasMany 'memberships'
  @hasMany 'members', through: 'memberships', className: 'User'
