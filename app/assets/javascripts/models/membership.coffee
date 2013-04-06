class Models.Membership extends Monarch.Record
  @tableName = 'Membership'
  @extended(this)

  @columns
    groupId: 'integer'
    userId: 'integer'

  @belongsTo 'group'
  @belongsTo 'user'
