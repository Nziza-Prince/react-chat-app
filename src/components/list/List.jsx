import React from 'react'
import User from './userInfo/User'
import Chatlist from './chatlist/Chatlist'
import './list.css'

const List = () => {
  return (
    <div className='list'>
      <User/>
      <Chatlist/>
    </div>
  )
}

export default List
