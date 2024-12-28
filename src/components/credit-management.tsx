'use client'

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { CreditCard, UserPlus, X, Info } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CheckedState } from "@radix-ui/react-checkbox"


interface User {
  id: string
  initials: string
  name: string
  credits: number
  color: string
  automation?: string
}

interface UserRowProps {
  user: User
  onAddCredits: (userId: string, amount: number) => void
  onRemoveCredits: (userId: string, amount: number) => void
  checked: boolean
  onCheckedChange: (checked: CheckedState) => void
  onSaveAutomation: (userId: string, amount: string) => void
  onRemoveUser: (userId: string) => void
}

const initialUsers: User[] = [
  { id: '2', initials: 'AL', name: 'Alice', credits: 50, color: 'bg-purple-500' },
  { id: '3', initials: 'CH', name: 'Charlie', credits: 25, color: 'bg-purple-600' },
  { id: '4', initials: 'DA', name: 'David', credits: 100, color: 'bg-red-400' },
  { id: '5', initials: 'EV', name: 'Eva', credits: 60, color: 'bg-pink-500' },
  { id: '6', initials: 'FR', name: 'Frank', credits: 40, color: 'bg-blue-500' },
  { id: '1', initials: 'BO', name: 'Bob', credits: 75, color: 'bg-red-500' },
]

const UserRow: React.FC<UserRowProps> = ({ user, onAddCredits, onRemoveCredits, checked, onCheckedChange, onSaveAutomation, onRemoveUser }) => {
  const [creditAmount, setCreditAmount] = useState<string>('')
  const [automationAmount, setAutomationAmount] = useState<string>('')

  return (
    <tr className="h-12 hover:bg-gray-50 border-b border-gray-200 last:border-b-0">
      <td className="py-4 px-4 text-center">
        <div className="flex items-center gap-4 min-h-[32px]">
         <Checkbox 
          checked={checked}
          onCheckedChange={(state: CheckedState) => onCheckedChange(state)}
          className="data-[state=checked]:bg-[#5b06be] data-[state=checked]:border-[#5b06be]"
          />
          <img
            src="https://res.cloudinary.com/drkudvyog/image/upload/v1734566580/Profila_photo_duha_s_bilym_pozadim_glyneq.png"
            alt={`${user.name}'s profile`}
            className="w-8 h-8 rounded-full object-cover"
          />
          <span className="font-medium">{user.name}</span>
        </div>
      </td>
      <td className="py-4 px-4 text-center">{user.credits} credits</td>
      <td className="py-4 px-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            {user.automation ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">{user.automation} credits/month</span>
                <Button
                  onClick={() => onSaveAutomation(user.id, '')}
                  className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-sm"
                >
                  Edit
                </Button>
              </div>
            ) : (
              <>
                <Input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={automationAmount}
                  onChange={(e) => setAutomationAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Amount"
                  className="px-3 py-1.5 rounded-lg border text-sm w-24"
                />
                <Button
                  onClick={() => {
                    if (automationAmount) {
                      onSaveAutomation(user.id, automationAmount)
                      setAutomationAmount('')
                    }
                  }}
                  disabled={!automationAmount}
                  className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm whitespace-nowrap"
                >
                  Save Automation
                </Button>
              </>
            )}
          </div>
        </div>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-4">
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={creditAmount}
            onChange={(e) => setCreditAmount(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="Amount"
            className="px-3 py-1.5 rounded-lg border text-sm w-24"
          />
          <Button
            onClick={() => {
              if (creditAmount) {
                onAddCredits(user.id, parseInt(creditAmount))
                setCreditAmount('')
              }
            }}
            disabled={!creditAmount}
            className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm"
          >
            Add To user
          </Button>
          <Button
            onClick={() => {
              if (creditAmount) {
                onRemoveCredits(user.id, parseInt(creditAmount))
                setCreditAmount('')
              }
            }}
            disabled={!creditAmount}
            className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm"
          >
            Withdraw From user
          </Button>
        </div>
      </td>
      <td className="py-4 px-4 text-center">
        <Button
          onClick={() => onRemoveUser(user.id)}
          variant="ghost"
          size="icon"
          className="hover:bg-red-100 hover:text-red-700"
        >
          <X className="h-5 w-5" />
        </Button>
      </td>
    </tr>
  )
}

export function CreditManagement() {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [managerCredits, setManagerCredits] = useState<number>(1000)
  const [checkedUsers, setCheckedUsers] = useState<{ [key: string]: boolean }>({})
  const [selectAll, setSelectAll] = useState(false)
  const [bulkAutomationAmount, setBulkAutomationAmount] = useState('')
  const [bulkCreditAmount, setBulkCreditAmount] = useState('')
  const [copyFeedback, setCopyFeedback] = useState('')

  const handleSelectAllChange = (checked: CheckedState) => {
    setSelectAll(!!checked)  // Convert CheckedState to boolean
  }

  useEffect(() => {
    if (selectAll) {
      const allChecked = users.reduce((acc, user) => ({ ...acc, [user.id]: true }), {})
      setCheckedUsers(allChecked)
    } else {
      setCheckedUsers({})
    }
  }, [selectAll, users])

  const handleAddCredits = (userId: string, amount: number) => {
    if (isNaN(amount) || amount <= 0 || amount > managerCredits) {
      alert('Invalid amount or insufficient manager credits')
      return
    }

    setUsers(users.map(user =>
      user.id === userId ? { ...user, credits: user.credits + amount } : user
    ))
    setManagerCredits(prev => prev - amount)
  }

  const handleRemoveCredits = (userId: string, amount: number) => {
    const user = users.find(u => u.id === userId)

    if (!user || isNaN(amount) || amount <= 0 || amount > user.credits) {
      alert('Invalid amount or insufficient user credits')
      return
    }

    setUsers(users.map(u =>
      u.id === userId ? { ...u, credits: u.credits - amount } : u
    ))
    setManagerCredits(prev => prev + amount)
  }

  const handleCopyInviteLink = () => {
    const inviteLink = "https://app.trainedbyai.com/signup-team-member?tid="
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopyFeedback('Copied!')
      setTimeout(() => setCopyFeedback(''), 2000)
    }).catch(err => {
      console.error('Failed to copy: ', err)
      setCopyFeedback('Failed to copy')
    })
  }

  const handleCheckUser = (userId: string, checked: CheckedState) => {
  setCheckedUsers(prev => ({
    ...prev,
    [userId]: checked as boolean
  }))
}

  const handleSaveAutomation = (userId: string, amount: string) => {
    setUsers(users.map(user =>
      user.id === userId ? { ...user, automation: amount } : user
    ))
  }

  const handleBulkAutomation = () => {
    const amount = bulkAutomationAmount
    if (!amount) {
      alert('Please enter an automation amount')
      return
    }

    const selectedUserIds = Object.entries(checkedUsers)
      .filter(([_, isChecked]) => isChecked)
      .map(([id]) => id)

    if (selectedUserIds.length === 0) {
      alert('Please select at least one user')
      return
    }

    setUsers(users.map(user =>
      selectedUserIds.includes(user.id) ? { ...user, automation: amount } : user
    ))
    setBulkAutomationAmount('')
  }

  const handleBulkAddCredits = () => {
    const amount = parseInt(bulkCreditAmount)
    if (isNaN(amount) || amount <= 0 || amount > managerCredits) {
      alert('Invalid amount or insufficient manager credits')
      return
    }
    const selectedUsers = Object.keys(checkedUsers).filter(id => checkedUsers[id])
    const totalAmount = amount * selectedUsers.length
    if (totalAmount > managerCredits) {
      alert('Insufficient manager credits for bulk operation')
      return
    }
    setUsers(users.map(user =>
      selectedUsers.includes(user.id) ? { ...user, credits: user.credits + amount } : user
    ))
    setManagerCredits(prev => prev - totalAmount)
    setBulkCreditAmount('')
  }

  const handleBulkRemoveCredits = () => {
    const amount = parseInt(bulkCreditAmount)
    if (isNaN(amount) || amount <= 0) {
      alert('Invalid amount')
      return
    }
    const selectedUsers = Object.keys(checkedUsers).filter(id => checkedUsers[id])
    const canRemove = users.every(user => 
      !selectedUsers.includes(user.id) || user.credits >= amount
    )
    if (!canRemove) {
      alert('One or more selected users have insufficient credits')
      return
    }
    setUsers(users.map(user =>
      selectedUsers.includes(user.id) ? { ...user, credits: user.credits - amount } : user
    ))
    setManagerCredits(prev => prev + amount * selectedUsers.length)
    setBulkCreditAmount('')
  }

  const handleRemoveUser = (userId: string) => {
    const userToRemove = users.find(user => user.id === userId)
    if (userToRemove) {
      setManagerCredits(prev => prev + userToRemove.credits)
      setUsers(users.filter(user => user.id !== userId))
      setCheckedUsers(prev => {
        const { [userId]: _, ...rest } = prev
        return rest
      })
    }
  }

  return (
    <div className="bg-white rounded-[20px] shadow-[0_0_10px_rgba(0,0,0,0.1)] pb-2 px-0 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-6 rounded-lg">
        <div className="flex items-center gap-4">
          <CreditCard className="w-8 h-8 text-[#5b06be]" />
          <h1 className="text-2xl font-[800] text-black">Credit Management</h1>
        </div>
        <div className="flex items-center gap-4 mt-4 sm:mt-0">
          <Card 
            className="bg-white border border-gray-200 shadow-sm py-2 px-4 flex items-center gap-2 cursor-pointer hover:border-[#5b06be] transition-colors duration-200 h-10"
          >
            <span className="text-sm font-[500] text-gray-600">Your Available Credits</span>
            <span className="text-xl font-[800] text-[#5b06be]">{managerCredits}</span>
          </Card>
          <Button
            onClick={handleCopyInviteLink}
            className="bg-[#5b06be] text-white hover:bg-[#4a05a2] flex items-center gap-2 h-10"
          >
            <UserPlus size={18} />
            {copyFeedback || 'Copy Invite Link'}
          </Button>
        </div>
      </div>
      <div className="flex-grow overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F4C550] text-white border-b border-[#F4C550]">
              <th className="py-4 px-4 font-semibold text-center">User</th>
              <th className="py-4 px-4 font-semibold text-center">
                <div className="flex items-center justify-center gap-2">
                  Credits
                  <Popover>
                    <PopoverTrigger>
                      <Info className="w-4 h-4 text-white cursor-pointer" />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <p className="text-sm">One credit = one minute of training</p>
                    </PopoverContent>
                  </Popover>
                </div>
              </th>
              <th className="py-4 px-4 font-semibold text-center">
                <div className="flex items-center justify-center gap-2">
                  Credits Automation
                  <Popover>
                    <PopoverTrigger>
                      <Info className="w-4 h-4 text-white cursor-pointer" />
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-2">
                      <p className="text-sm">Credits are added every month</p>
                    </PopoverContent>
                  </Popover>
                </div>
              </th>
              <th className="py-4 px-4 font-semibold text-center">One Time Credit Usage</th>
              <th className="py-4 px-4 font-semibold text-center">Remove</th>
            </tr>
          </thead>
          <tbody>
            <tr className="h-12 bg-gray-100 border-b-2 border-gray-300">
              <td className="py-4 px-4 text-center">
                <div className="flex items-center gap-4 min-h-[32px]">
                  <Checkbox 
                    checked={selectAll}
                    onCheckedChange={handleSelectAllChange}
                    className="data-[state=checked]:bg-[#5b06be] data-[state=checked]:border-[#5b06be]"
                  />
                  <span className="font-medium">Select All Users</span>
                </div>
              </td>
              <td className="py-4 px-4 text-center">-</td>
              <td className="py-4 px-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={bulkAutomationAmount}
                      onChange={(e) => setBulkAutomationAmount(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="Amount"
                      className="px-3 py-1.5 rounded-lg border text-sm w-24"
                    />
                    <Button
                      onClick={handleBulkAutomation}
                      disabled={!bulkAutomationAmount}
                      className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm whitespace-nowrap"
                    >
                      Save Automation for All
                    </Button>
                  </div>
                </div>
              </td>
              <td className="py-4 px-4">
                <div className="flex items-center gap-4">
                  <Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={bulkCreditAmount}
                    onChange={(e) => setBulkCreditAmount(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="Amount"
                    className="px-3 py-1.5 rounded-lg border text-sm w-24"
                  />
                  <Button
                    onClick={handleBulkAddCredits}
                    disabled={!bulkCreditAmount}
                    className="px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-sm"
                  >
                    Add To All
                  </Button>
                  <Button
                    onClick={handleBulkRemoveCredits}
                    disabled={!bulkCreditAmount}
                    className="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg text-sm"
                  >
                    Withdraw From All
                  </Button>
                </div>
              </td>
              <td className="py-4 px-4 text-center">-</td>
            </tr>
            {users.map(user => (
              <UserRow
                key={user.id}
                user={user}
                onAddCredits={handleAddCredits}
                onRemoveCredits={handleRemoveCredits}
                checked={checkedUsers[user.id] || false}
                onCheckedChange={(checked) => handleCheckUser(user.id, checked)}
                onSaveAutomation={handleSaveAutomation}
                onRemoveUser={handleRemoveUser}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

