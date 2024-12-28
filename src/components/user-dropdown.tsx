import React from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface User {
  id: string
  name: string
  credits: number
}

interface UserDropdownProps {
  users: User[]
  selectedUser: string
  onSelectUser: (userId: string) => void
}

export function UserDropdown({ users, selectedUser, onSelectUser }: UserDropdownProps) {
  const selectedUserData = users.find(user => user.id === selectedUser)

  return (
    <Select onValueChange={onSelectUser} value={selectedUser}>
      <SelectTrigger 
        className="w-full border-gray-200 hover:border-gray-300 focus:border-[#5b06be] focus:ring-1 focus:ring-[#5b06be] bg-white text-base font-[500]"
      >
        <SelectValue 
          placeholder="Select a user"
          className="text-base"
        >
          {selectedUserData ? (
            <div className="flex justify-between items-center w-full gap-4">
              <span className="font-[500]">{selectedUserData.name}</span>
              <span className="text-[#5b06be] font-[500]">{selectedUserData.credits} credits</span>
            </div>
          ) : (
            "Select a user"
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-white border border-[#5b06be]/30">
        {users.map((user) => (
          <SelectItem 
            key={user.id} 
            value={user.id}
            className="hover:bg-[#5b06be]/10 focus:bg-[#5b06be]/10"
          >
            <div className="flex justify-between items-center w-full gap-4">
              <span className="font-[500]">{user.name}</span>
              <span className="text-[#5b06be] font-[500]">{user.credits} credits</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

