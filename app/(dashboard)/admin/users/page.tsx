'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../../../lib/supabaseClient'
import AddUserForm from '@/components/AddUserForm'
import DeleteUserModal from '@/components/DeleteUserModal'

export default function UsersAdmin() {
    const [users, setUsers] = useState<any[]>([])
    const [showForm, setShowForm] = useState(false)
    const [editingUser, setEditingUser] = useState<any>(null)
    const [deleteUserId, setDeleteUserId] = useState<string | null>(null)
    const [deleteLoading, setDeleteLoading] = useState(false)


    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        const { data } = await supabase.from('users').select('*')
        setUsers(data || [])
    }

    // EDIT
    const handleEdit = (user: any) => {
        setEditingUser(user)
        setShowForm(true)
    }

    // DELETE
    const confirmDelete = async () => {
        if (!deleteUserId) return

        setDeleteLoading(true)

        const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', deleteUserId)

        setDeleteLoading(false)

        if (error) {
            alert('Error deleting user')
        } else {
            setDeleteUserId(null)
            fetchUsers()
        }
    }

    return (
        <div className="max-w-5xl mx-auto">

            {/* Header */}
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-semibold">Users</h1>

                <button
                    onClick={() => {
                        setEditingUser(null)
                        setShowForm(true)
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer"
                >
                    Add User
                </button>
            </div>

            {/* List */}
            <div className="bg-white p-4 rounded shadow">
                {users.length === 0 ? (
                    <p className="text-gray-500">No users found</p>
                ) : (
                    users.map((user) => (
                        <div
                            key={user.id}
                            className="flex justify-between items-center border-b py-2"
                        >
                            <div>
                                <div>{user.name}</div>
                                <div className="text-gray-500 text-sm">{user.email}</div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleEdit(user)}
                                    className="px-3 py-1 bg-yellow-500 text-white rounded cursor-pointer"
                                >
                                    Edit
                                </button>

                                <button
                                    onClick={() => setDeleteUserId(user.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded cursor-pointer"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal */}
            {showForm && (
                <AddUserForm
                    onClose={() => {
                        setShowForm(false)
                        setEditingUser(null)
                    }}
                    onSuccess={fetchUsers}
                    editUser={editingUser}
                />
            )}

            {deleteUserId && (
                <DeleteUserModal
                    onClose={() => setDeleteUserId(null)}
                    onConfirm={confirmDelete}
                    loading={deleteLoading}
                />
            )}



        </div>
    )
}