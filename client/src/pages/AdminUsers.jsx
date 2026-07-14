import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { adminUsers } from "../data/admin";
import { FcSearch } from "react-icons/fc";

export default function AdminUsers() {
  const [searchParams] = useSearchParams();
  const highlightUserId = searchParams.get("id");

  const [users, setUsers] = useState(adminUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (highlightUserId) {
      const user = users.find((u) => String(u.id) === String(highlightUserId));
      if (user) {
        setSelectedUser(user);
      }
    }
  }, [highlightUserId, users]);

  const filteredUsers = useMemo(() => {
    return users.filter(
      (user) =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [users, searchTerm]);

  const toggleUserStatus = (userId, currentStatus) => {
    const nextStatus = currentStatus === "Active" ? "Inactive" : "Active";

    setUsers((prevUsers) =>
      prevUsers.map((u) =>
        u.id === userId ? { ...u, status: nextStatus } : u,
      ),
    );

    setSelectedUser((prevSelected) => {
      if (!prevSelected) return prevSelected;
      if (prevSelected.id !== userId) return prevSelected;
      return { ...prevSelected, status: nextStatus };
    });
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            View the user list and inspect user details quickly.
          </p>
        </div>
        <div className="flex rounded-lg border border-gray-300 bg-white px-3 py-2 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <span className="text-gray-500 pt-1">
            <FcSearch />
          </span>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search users..."
            className="ml-2 w-full bg-transparent outline-none dark:text-white"
          />
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <table className="min-w-full divide-y divide-gray-200 text-left text-sm dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                  Name
                </th>
                <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                  Email
                </th>
                <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                  Role
                </th>
                <th className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-800 dark:bg-gray-900">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                  onClick={() => setSelectedUser(user)}
                >
                  <td className="px-4 py-4 dark:text-white font-medium">
                    {user.name}
                  </td>
                  <td className="px-4 py-4 text-gray-600 dark:text-gray-400">
                    {user.email}
                  </td>
                  <td className="px-4 py-4 dark:text-white">{user.role}</td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400"
                        }`}
                      >
                        {user.status}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleUserStatus(user.id, user.status);
                        }}
                        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${user.status === "Active" ? "bg-green-500" : "bg-gray-400"}`}
                        aria-label={`Toggle status for ${user.name}`}
                      >
                        <span
                          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${user.status === "Active" ? "translate-x-6" : "translate-x-1"}`}
                        />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold dark:text-white">
            User Details
          </h2>
          {selectedUser ? (
            <div className="space-y-3">
              <p className="text-lg font-semibold dark:text-white">
                {selectedUser.name}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {selectedUser.email}
              </p>
              <p className="text-sm dark:text-gray-300">
                <span className="font-semibold">Role:</span> {selectedUser.role}
              </p>
              <p className="text-sm dark:text-gray-300">
                <span className="font-semibold">Status:</span>{" "}
                {selectedUser.status}
              </p>
              <p className="text-sm dark:text-gray-300">
                <span className="font-semibold">Joined:</span>{" "}
                {selectedUser.joined}
              </p>
              <p className="text-sm dark:text-gray-300">
                <span className="font-semibold">Orders:</span>{" "}
                {selectedUser.orders}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select a user to view details.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
