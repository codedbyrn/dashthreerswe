"use client";

import React, { useState, useTransition } from "react";
import {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  toggleEmployeeStatus,
} from "@/auth/services/adminService";
import Alert from "@/auth/components/Alert";
import Spinner from "@/auth/components/Spinner";
import Link from "next/link";
import { Icon } from "@/components/Icons";

interface User {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string;
}

interface UserManagementClientProps {
  initialUsers: User[];
  currentUserId: string;
}

export default function UserManagementClient({
  initialUsers,
  currentUserId,
}: UserManagementClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [roleInput, setRoleInput] = useState("staff");
  const [isActiveInput, setIsActiveInput] = useState(true);

  // Status feedback
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isPending, startTransition] = useTransition();

  // Filter users based on search query and status filters
  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
    const matchesStatus =
      statusFilter === "all"
        ? true
        : statusFilter === "active"
        ? u.is_active === true
        : u.is_active === false;
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Open edit modal and populate inputs
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setEmailInput(user.email);
    setRoleInput(user.role);
    setIsActiveInput(user.is_active);
    setError("");
    setSuccess("");
    setIsEditOpen(true);
  };

  // Open delete confirmation modal
  const openDeleteModal = (user: User) => {
    setSelectedUser(user);
    setError("");
    setSuccess("");
    setIsDeleteOpen(true);
  };

  // Create new employee submit
  const handleCreateSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createEmployee(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(result?.success || "Account created successfully.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    });
  };

  // Edit employee submit
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setError("");
    setSuccess("");

    startTransition(async () => {
      const result = await updateEmployee(
        selectedUser.id,
        emailInput,
        roleInput as "superuser" | "staff",
        isActiveInput
      );
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(result?.success || "Profile updated successfully.");
        setUsers((prev) =>
          prev.map((u) =>
            u.id === selectedUser.id
              ? { ...u, email: emailInput, role: roleInput, is_active: isActiveInput }
              : u
          )
        );
        setTimeout(() => setIsEditOpen(false), 1500);
      }
    });
  };

  // Toggle account activation status
  const handleToggleActive = async (user: User) => {
    if (user.id === currentUserId) {
      alert("You cannot deactivate your own current account.");
      return;
    }
    setError("");
    setSuccess("");

    const newStatus = !user.is_active;

    startTransition(async () => {
      const result = await toggleEmployeeStatus(user.id, newStatus);
      if (result?.error) {
        alert(result.error);
      } else {
        setUsers((prev) =>
          prev.map((u) => (u.id === user.id ? { ...u, is_active: newStatus } : u))
        );
      }
    });
  };

  // Confirm and execute employee deletion
  const handleDeleteConfirm = async () => {
    if (!selectedUser) return;
    setError("");
    setSuccess("");

    startTransition(async () => {
      const result = await deleteEmployee(selectedUser.id);
      if (result?.error) {
        setError(result.error);
      } else {
        setSuccess(result?.success || "Employee deleted successfully.");
        setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        setTimeout(() => setIsDeleteOpen(false), 1500);
      }
    });
  };

  return (
    <div className="w-full space-y-6 animate-fade-in font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-[#e4d7d0]/60 pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-brand-main2 uppercase">
            Administration
          </span>
          <h1 className="font-serif text-3xl font-bold text-brand-dark mt-1">
            Employee Management
          </h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Create, edit, suspend, and delete team member profiles and access credentials.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="px-4 py-2 border border-[#e4d7d0] rounded-default text-sm text-gray-600 bg-white hover:bg-gray-50 hover:text-brand-dark transition-all duration-180 font-semibold"
          >
            Overview
          </Link>
          <button
            onClick={() => {
              setError("");
              setSuccess("");
              setIsCreateOpen(true);
            }}
            className="px-5 py-2 rounded-default bg-brand-main2 hover:bg-brand-main2/95 text-white transition-all duration-180 text-sm font-semibold shadow-sm hover:shadow cursor-pointer"
          >
            + Add New Employee
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white p-5 rounded-default border border-[#e4d7d0]/60 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-brand-dark/60 uppercase tracking-wider mb-1.5">
            Search by Email
          </label>
          <input
            type="text"
            placeholder="e.g., employee@company.com"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-[#e4d7d0] rounded-default px-3 py-2 text-sm focus:border-brand-main2 focus:ring-1 focus:ring-brand-main2 focus:outline-none bg-brand-bg/10"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-dark/60 uppercase tracking-wider mb-1.5">
            Filter by Role
          </label>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="w-full border border-[#e4d7d0] rounded-default px-3 py-2 text-sm focus:border-brand-main2 focus:outline-none bg-brand-bg/10"
          >
            <option value="all">All Roles</option>
            <option value="superuser">Superuser (System Admin)</option>
            <option value="staff">Staff (Editor)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-brand-dark/60 uppercase tracking-wider mb-1.5">
            Filter by Status
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full border border-[#e4d7d0] rounded-default px-3 py-2 text-sm focus:border-brand-main2 focus:outline-none bg-brand-bg/10"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="deactivated">Deactivated Only</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-default border border-[#e4d7d0]/60 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-[10px] font-bold uppercase tracking-wider border-b border-[#e4d7d0]/60">
                <th className="px-6 py-4">Employee Details</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-serif">
                    No employees matching the search filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-brand-bg/10 transition-colors duration-180 min-h-[56px]"
                  >
                    <td className="px-6 py-4 font-medium text-brand-dark">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-main2/10 border border-brand-main2/20 text-brand-main2 flex items-center justify-center font-bold text-xs uppercase select-none">
                          {user.email.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <span className="block font-serif text-sm truncate font-semibold">
                            {user.email}
                          </span>
                          {user.id === currentUserId && (
                            <span className="inline-block mt-0.5 text-[10px] bg-brand-bg text-brand-dark px-1.5 py-0.5 rounded-full border border-[#e4d7d0]">
                              Current Account
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === "superuser" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                          Superuser
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                          Staff
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
                          Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Suspension toggle button */}
                        <button
                          onClick={() => handleToggleActive(user)}
                          disabled={user.id === currentUserId || isPending}
                          className={`px-3 py-1.5 rounded-default text-xs font-semibold border transition-all duration-150 cursor-pointer ${
                            user.is_active
                              ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100/50 disabled:opacity-50"
                              : "bg-green-50 text-green-600 border-green-200 hover:bg-green-100/50 disabled:opacity-50"
                          }`}
                        >
                          {user.is_active ? "Suspend" : "Activate"}
                        </button>

                        {/* Edit details */}
                        <button
                          onClick={() => openEditModal(user)}
                          disabled={user.id === currentUserId || isPending}
                          className="px-3 py-1.5 rounded-default text-xs font-semibold border border-[#e4d7d0] text-gray-700 hover:bg-gray-50 hover:text-brand-dark transition-all duration-150 disabled:opacity-50 cursor-pointer"
                        >
                          Edit
                        </button>

                        {/* Delete account */}
                        <button
                          onClick={() => openDeleteModal(user)}
                          disabled={user.id === currentUserId || isPending}
                          className="px-3 py-1.5 rounded-default text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-all duration-150 disabled:opacity-50 cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE EMPLOYEE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-default shadow-xl border border-[#e4d7d0] overflow-hidden text-left animate-scale-up">
            <div className="p-6">
              <h3 className="font-serif text-lg font-bold text-brand-dark border-b border-gray-100 pb-3 mb-4">
                Add New Employee Account
              </h3>

              <Alert message={error} />
              {success && (
                <div className="p-3 mb-4 text-sm text-green-700 bg-green-50 rounded-default border border-green-200">
                  {success}
                </div>
              )}

              <form onSubmit={handleCreateSubmit} className="space-y-4 font-sans text-sm">
                <div>
                  <label className="block font-semibold text-brand-dark/70">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full border border-[#e4d7d0] rounded-default p-2.5 mt-1 focus:border-brand-main2 focus:outline-none"
                    placeholder="example@company.com"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-brand-dark/70">Temporary Password</label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full border border-[#e4d7d0] rounded-default p-2.5 mt-1 focus:border-brand-main2 focus:outline-none"
                    placeholder="•••••••••"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    Password must be at least 9 characters and include uppercase, lowercase, numbers, and symbols.
                  </p>
                </div>

                <div>
                  <label className="block font-semibold text-brand-dark/70">Access Role</label>
                  <select
                    name="role"
                    defaultValue="staff"
                    className="w-full border border-[#e4d7d0] rounded-default p-2.5 mt-1 focus:border-brand-main2 focus:outline-none bg-white"
                  >
                    <option value="staff">Staff (Editor)</option>
                    <option value="superuser">Superuser (System Admin)</option>
                  </select>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={isPending}
                    className="px-4 py-2 border border-[#e4d7d0] rounded-default text-sm text-gray-600 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-default bg-brand-main2 hover:bg-brand-main2/95 text-white transition-all text-sm font-semibold flex items-center justify-center min-w-[100px] cursor-pointer"
                  >
                    {isPending ? <Spinner /> : "Save Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE MODAL */}
      {isEditOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-default shadow-xl border border-[#e4d7d0] overflow-hidden text-left animate-scale-up">
            <div className="p-6">
              <h3 className="font-serif text-lg font-bold text-brand-dark border-b border-gray-100 pb-3 mb-4">
                Modify Employee Account
              </h3>

              <Alert message={error} />
              {success && (
                <div className="p-3 mb-4 text-sm text-green-700 bg-green-50 rounded-default border border-green-200">
                  {success}
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-4 font-sans text-sm">
                <div>
                  <label className="block font-semibold text-brand-dark/70">Email Address</label>
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    className="w-full border border-[#e4d7d0] rounded-default p-2.5 mt-1 focus:border-brand-main2 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-brand-dark/70">Access Role</label>
                  <select
                    value={roleInput}
                    onChange={(e) => setRoleInput(e.target.value)}
                    className="w-full border border-[#e4d7d0] rounded-default p-2.5 mt-1 focus:border-brand-main2 focus:outline-none bg-white"
                  >
                    <option value="staff">Staff (Editor)</option>
                    <option value="superuser">Superuser (System Admin)</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="isActiveCheck"
                    checked={isActiveInput}
                    onChange={(e) => setIsActiveInput(e.target.checked)}
                    className="h-4 w-4 rounded border-[#e4d7d0] text-brand-main2 focus:ring-brand-main2 accent-brand-main2"
                  />
                  <label htmlFor="isActiveCheck" className="text-sm font-semibold text-brand-dark/80 select-none">
                    Account Active (Allows sign-in access)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditOpen(false)}
                    disabled={isPending}
                    className="px-4 py-2 border border-[#e4d7d0] rounded-default text-sm text-gray-600 bg-white hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isPending}
                    className="px-5 py-2 rounded-default bg-brand-main2 hover:bg-brand-main2/95 text-white transition-all text-sm font-semibold flex items-center justify-center min-w-[120px] cursor-pointer"
                  >
                    {isPending ? <Spinner /> : "Update Details"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* DELETE EMPLOYEE MODAL */}
      {isDeleteOpen && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-dark/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-default shadow-xl border border-[#e4d7d0] overflow-hidden text-left animate-scale-up">
            <div className="p-6">
              <h3 className="font-serif text-lg font-bold text-red-600 border-b border-gray-100 pb-3 mb-4">
                Confirm Permanent Deletion
              </h3>

              <Alert message={error} />
              {success && (
                <div className="p-3 mb-4 text-sm text-green-700 bg-green-50 rounded-default border border-green-200">
                  {success}
                </div>
              )}

              <p className="text-sm text-gray-600 leading-relaxed mb-6 font-sans">
                Are you absolutely sure you want to permanently delete the profile of{" "}
                <strong className="text-brand-dark">{selectedUser.email}</strong>?
                <br />
                <span className="text-red-500 font-semibold block mt-2 text-xs">
                  Warning: This action is destructive and cannot be undone. It removes user profiles, session cookies, and login records.
                </span>
              </p>

              <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsDeleteOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 border border-[#e4d7d0] rounded-default text-sm text-gray-600 bg-white hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteConfirm}
                  disabled={isPending}
                  className="px-5 py-2 rounded-default bg-red-600 hover:bg-red-700 text-white transition-all text-sm font-semibold flex items-center justify-center min-w-[120px] cursor-pointer"
                >
                  {isPending ? <Spinner /> : "Confirm Delete"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
