"use client";
import React, {useState, useEffect, useRef} from "react";
import {FaTrash, FaUserTag, FaCrown, FaSearch, FaPlus} from "react-icons/fa";
import Sidebar from '../../../components/dashboard/sidebar';
import AppToaster from "../../../components/ui/toaster";
import toast from "react-hot-toast";
import Modal from "../../../components/ui/modal-dashboard";
import ConfirmModal from "../../../components/ui/confirm-modal";
import {useAuth} from "../../../context/AuthContext";
import {useRouter} from "next/navigation";

export default function UserManagementDashboard() {
    const {authState} = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (authState === "unauthenticated") {
            router.replace("/login");
        }
    }, [authState, router]);

    if (authState === "loading" || authState === "unauthenticated") {
        return (
            <div
                className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#14121a] via-[#1a1b20] to-[#232339]">
                <div className="text-center">
                    <svg className="mx-auto animate-spin h-10 w-10 text-pink-400 mb-4" viewBox="0 0 24 24" fill="none">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" className="opacity-20"/>
                        <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                    <div className="text-gray-400">Checking authentication...</div>
                </div>
            </div>
        );
    }

    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [modalType, setModalType] = useState(""); // "edit", "delete", "assign", "plan", "detail", "create"
    const [showModal, setShowModal] = useState(false);

    // Pagination
    const [page, setPage] = useState(1);
    const [size, setSize] = useState(10);
    const [total, setTotal] = useState(0);
    const [pages, setPages] = useState(1);
    const [loading, setLoading] = useState(false);

    const [userDetail, setUserDetail] = useState(null);
    const [detailLoading, setDetailLoading] = useState(false);

    const [planDetail, setPlanDetail] = useState(null);

    // Confirm promise-like mechanism
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmOpts, setConfirmOpts] = useState({});
    const confirmResolveRef = useRef(null);

    const confirm = (opts = {}) => {
        setConfirmOpts({
            title: opts.title || "Are you sure?",
            description: opts.description || "",
            confirmText: opts.confirmText || "Yes",
            cancelText: opts.cancelText || "Cancel",
            tone: opts.tone || "danger",
        });
        setConfirmOpen(true);
        return new Promise((resolve) => {
            confirmResolveRef.current = resolve;
        });
    };

    const handleConfirmResult = (result) => {
        setConfirmOpen(false);
        if (confirmResolveRef.current) {
            confirmResolveRef.current(result);
            confirmResolveRef.current = null;
        }
    };

    // Helper: open confirm but hide current modal while confirm is visible.
    const openConfirmFromModal = async (opts = {}) => {
        const prevSelected = selectedUser;
        const prevModalType = modalType;
        const wasOpen = showModal;

        // hide current modal
        setShowModal(false);

        const ok = await confirm(opts);

        // if canceled, restore modal
        if (!ok && wasOpen) {
            setSelectedUser(prevSelected);
            setModalType(prevModalType);
            setShowModal(true);
        }

        return ok;
    };

    const openPlanModal = (plan) => {
        setPlanDetail(plan);
        setShowModal(true);
        setModalType("plan");
    };

    // Fetch users from API
    const fetchUsers = async (params = {}) => {
        setLoading(true);
        try {
            const qp = new URLSearchParams({
                page: params.page ?? page,
                size: params.size ?? size,
                search: params.search ?? search,
            });
            const res = await fetch(`/api/special-one/users?${qp.toString()}`, {
                method: "GET",
            });
            const data = await res.json();
            setUsers(data.data || []);
            setTotal(data.pagination?.total ?? 0);
            setPages(data.pagination?.pages ?? 1);
        } catch (err) {
            setUsers([]);
            setTotal(0);
            setPages(1);
            toast.error("Failed to fetch users");
        } finally {
            setLoading(false);
        }
    };

    const fetchUserDetail = async (id) => {
        setDetailLoading(true);
        try {
            const res = await fetch(`/api/special-one/users/${id}`);
            const data = await res.json();
            if (res.ok) {
                setUserDetail(data.data);
                setModalType("detail");
                setShowModal(true);
            } else {
                toast.error(data.message || "Failed to load detail");
            }
        } catch (err) {
            toast.error(err.message || "Error fetching detail");
        } finally {
            setDetailLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        // eslint-disable-next-line
    }, [page, size]);

    // Search handler
    const handleSearch = (e) => {
        e?.preventDefault();
        setPage(1);
        fetchUsers({page: 1, search});
    };

    // Pagination handler
    const handlePrev = () => setPage((p) => (p > 1 ? p - 1 : 1));
    const handleNext = () => setPage((p) => (p < pages ? p + 1 : pages));

    // Modal helpers
    const openModal = (user, type) => {
        setSelectedUser(user);
        setModalType(type);
        setShowModal(true);
    };
    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setModalType("");
    };

    const [newUser, setNewUser] = useState({
        email: "",
        username: "",
        is_admin: false,
        is_active: true,
    });


    const handleCreateUser = async () => {
        if (!newUser.username || !newUser.email) {
            toast.error("Please fill in both username and email.");
            return;
        }

        const id = toast.loading("Creating user...");
        try {
            const res = await fetch("/api/special-one/create-user", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(newUser),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(`User ${data.data.username} has been created.`, {id});
                closeModal();
                // reset newUser (optional)
                setNewUser({email: "", username: "", is_admin: false, is_active: true});
                fetchUsers();
            } else {
                toast.error(data.message || "Failed to create user", {id});
            }
        } catch (err) {
            toast.error(err.message || "Error creating user", {id});
        }
    };

    const handleUpdateUser = async () => {
        if (!selectedUser) return;
        const id = toast.loading("Updating user...");
        try {
            const res = await fetch(`/api/special-one/users/${selectedUser._id}`, {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    email: selectedUser.email,
                    username: selectedUser.username,
                    is_admin: selectedUser.is_admin,
                    is_active: selectedUser.is_active,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                toast.success("User updated", {id});
                closeModal();
                fetchUsers();
            } else {
                toast.error(data.message || "Failed to update", {id});
            }
        } catch (err) {
            toast.error(err.message || "Error updating user", {id});
        }
    };

    const handleMakeAdmin = async (user = selectedUser) => {
        if (!user) return;
        const ok = await openConfirmFromModal({
            title: "Make Admin?",
            description: `Are you sure you want to make an admin?`,
            confirmText: "Yes, Make Admin",
            cancelText: "Cancel",
            tone: "primary",
        });
        if (!ok) return;

        const id = toast.loading("Updating user role...");
        try {
            const res = await fetch(`/api/special-one/users/${user._id}/make-admin`, {method: "POST"});
            const data = await res.json();
            if (res.ok) {
                toast.success("User is now an admin.", {id});
                // confirm already closed modal; refresh list
                fetchUsers();
            } else {
                toast.error(data.message || "Unable to make admin.", {id});
            }
        } catch (err) {
            toast.error(err.message || "Error!", {id});
        }
    };

    const handleRemoveAdmin = async (user = selectedUser) => {
        if (!user) return;
        const ok = await openConfirmFromModal({
            title: "Remove Admin?",
            description: `Are you sure you want to remove from admin role?`,
            confirmText: "Yes, Remove",
            cancelText: "Cancel",
            tone: "danger",
        });
        if (!ok) return;

        const id = toast.loading("Updating user role...");
        try {
            const res = await fetch(`/api/special-one/users/${user._id}/remove-admin`, {method: "POST"});
            const data = await res.json();
            if (res.ok) {
                toast.success("User is no longer an admin.", {id});
                fetchUsers();
            } else {
                toast.error(data.message || "Unable to remove admin.", {id});
            }
        } catch (err) {
            toast.error(err.message || "Error!", {id});
        }
    };

    const handleDeleteUser = async (user = selectedUser) => {
        if (!user) return;
        const ok = await openConfirmFromModal({
            title: "Delete User",
            description: `Delete ${user.username}? This action cannot be undone.`,
            confirmText: "Delete",
            cancelText: "Cancel",
            tone: "danger",
        });
        if (!ok) return;

        const id = toast.loading("Deleting user...");
        try {
            const res = await fetch(`/api/special-one/users/${user._id}`, {method: "DELETE"});
            const data = await res.json();
            if (res.ok) {
                toast.success("User has been removed.", {id});
                fetchUsers();
            } else {
                toast.error(data.message || "Failed to delete", {id});
            }
        } catch (err) {
            toast.error(err.message || "Error", {id});
        }
    };

    //
    // UI
    //
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#14121a] via-[#1a1b20] to-[#0d0e13] flex">
            <AppToaster/>
            <Sidebar/>
            <main className="flex-1 flex flex-col">
                {/* Header */}
                <header
                    className="flex items-center justify-between px-8 py-6 border-b border-[#23232b] bg-gradient-to-r from-[#19191d] to-[#23232b] shadow">
                    <h1 className="text-2xl font-semibold text-white tracking-tight">User Management</h1>
                    <form onSubmit={handleSearch} className="flex items-center gap-3">
                        <input
                            type="text"
                            placeholder="Search user / email"
                            className="bg-[#0f1724] px-4 py-2 rounded-lg text-gray-200 border border-gray-800 focus:ring-2 focus:ring-pink-600 transition w-64"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <button
                            type="submit"
                            className="bg-pink-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow hover:bg-pink-700 transition"
                        >
                            <FaSearch/> Search
                        </button>
                        <button
                            type="button"
                            className="bg-[#111217] text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 shadow hover:bg-[#17202a] transition"
                            onClick={() => {
                                setModalType("create");
                                setShowModal(true);
                            }}
                        >
                            <FaPlus/> Add User
                        </button>
                    </form>
                </header>

                <section
                    className="p-8 flex-1 bg-gradient-to-br from-[#161622] via-[#18181c] to-[#232339] overflow-auto">
                    {/* Table */}
                    <div
                        className="rounded-xl shadow-2xl overflow-hidden bg-[#19191d] border border-[#22222b] animate-fade-in">
                        <table className="min-w-full text-[14px] font-mono">
                            <thead>
                            <tr className="bg-gradient-to-r from-[#17171b] to-[#23232a] text-pink-400 font-bold border-b border-[#23232b]">
                                <th className="py-4 px-4 text-left">Access ID</th>
                                <th className="py-4 px-4 text-left">Domain</th>
                                <th className="py-4 px-4 text-left">Plan</th>
                                <th className="py-4 px-4 text-left">Expired</th>
                                <th className="py-4 px-4 text-left">Created</th>
                                <th className="py-4 px-4 text-left">Last Login</th>
                                <th className="py-4 px-4 text-left">Status</th>
                                <th className="py-4 px-4 text-left">Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={8}
                                        className="py-12 px-6 text-center text-pink-400 animate-pulse font-semibold">
                                        Loading...
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={8} className="py-12 px-6 text-center text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <svg className="w-12 h-12 mb-4 text-gray-600" fill="none"
                                                 stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                                                      d="M9.172 16.172a4 4 0 0 1 5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
                                            </svg>
                                            <p className="text-lg font-semibold">No users found</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => {
                                    const planInfo = user.myPlan || {};
                                    const domain = planInfo.registered_domain?.[0] || "-";
                                    const expired = planInfo.expired ? new Date(planInfo.expired).toLocaleDateString("id-ID") : "-";
                                    const created = user.created_at ? new Date(user.created_at).toLocaleDateString("id-ID") : "-";
                                    const lastLogin = user.last_login ? new Date(user.last_login).toLocaleDateString("id-ID") : "Never";
                                    const status = planInfo.plan ? "active" : "inactive";

                                    return (
                                        <tr key={user._id}
                                            className="group hover:bg-gradient-to-r from-[#0f1724] to-[#1f1726]/10 transition-colors">
                                            <td className="py-3 px-4 text-white font-semibold">{user.access_id}</td>
                                            <td className="py-3 px-4 text-cyan-300 font-semibold">{domain}</td>

                                            <td className="py-3 px-4">
                                                {user.myPlan ? (
                                                    <button
                                                        onClick={() => openPlanModal(user.myPlan)}
                                                        className="bg-cyan-700 hover:bg-cyan-800 px-3 py-1 rounded-lg text-white text-sm font-semibold transition"
                                                    >
                                                        View Plan
                                                    </button>
                                                ) : (
                                                    <span className="text-gray-500 italic">No Plan</span>
                                                )}
                                            </td>

                                            <td className="py-3 px-4 text-gray-400">{expired}</td>
                                            <td className="py-3 px-4 text-gray-400">{created}</td>
                                            <td className="py-3 px-4 text-gray-400">{lastLogin}</td>
                                            <td className="py-3 px-4">
                                                  <span
                                                      className={`px-3 py-1 rounded-lg text-xs font-semibold ${status === "active" ? "bg-green-900 text-green-400" : "bg-red-900 text-red-400"}`}>
                                                    {status}
                                                  </span>
                                            </td>
                                            <td className="py-3 px-4 flex gap-2">
                                                <button
                                                    className="p-2 rounded-lg bg-[#0f1724] text-cyan-400 hover:bg-cyan-800 transition"
                                                    title="View Detail"
                                                    onClick={() => fetchUserDetail(user._id)}
                                                >
                                                    <FaCrown/>
                                                </button>
                                                <button
                                                    className="p-2 rounded-lg bg-[#0f1724] text-red-400 hover:bg-red-800 transition"
                                                    title="Delete User"
                                                    onClick={() => openModal(user, "delete")}
                                                >
                                                    <FaTrash/>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex justify-between items-center mt-6 text-gray-400">
                        <div>
                            <span>Page {page} of {pages}, Total: {total} users</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                className="px-4 py-2 bg-[#0b0f14] rounded-lg border border-gray-800 font-semibold hover:bg-[#11151b] transition"
                                disabled={page === 1}
                                onClick={handlePrev}
                            >
                                Previous
                            </button>
                            <button
                                className="px-4 py-2 bg-pink-600 rounded-lg border border-pink-700 font-semibold hover:bg-pink-700 transition"
                                disabled={page === pages || pages === 0}
                                onClick={handleNext}
                            >
                                Next
                            </button>
                            <label className="ml-2">Show</label>
                            <select
                                className="bg-[#0b0f14] px-2 py-1 rounded border border-gray-800 text-gray-200"
                                value={size}
                                onChange={(e) => {
                                    setSize(Number(e.target.value));
                                    setPage(1);
                                }}
                            >
                                {[10, 20, 50, 100].map((s) => (
                                    <option key={s} value={s}>
                                        {s} per page
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>
            </main>

            {/* Confirm Modal (global for this page) */}
            <ConfirmModal
                isOpen={confirmOpen}
                opts={confirmOpts}
                onClose={() => handleConfirmResult(false)}
                onResult={handleConfirmResult}
            />

            {/* Main modal (create, edit, assign, delete, plan, detail) */}
            <Modal
                isOpen={showModal}
                title={
                    modalType === "create"
                        ? "Add New User"
                        : modalType === "edit"
                            ? "Edit User"
                            : modalType === "assign"
                                ? `Manage Admin Role for ${selectedUser?.username ?? ""}`
                                : modalType === "delete"
                                    ? "Delete User?"
                                    : modalType === "plan"
                                        ? "Plan Details"
                                        : modalType === "detail"
                                            ? "User Detail"
                                            : ""
                }
                onClose={closeModal}
                size={modalType === "detail" ? "lg" : "md"}
            >
                {/* CREATE */}
                {modalType === "create" && (
                    <div className="space-y-3">
                        <input
                            type="text"
                            placeholder="Username"
                            value={newUser.username}
                            onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                            className="mb-2 px-4 py-2 rounded-lg bg-[#0f1724] border border-gray-800 text-white w-full"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={newUser.email}
                            onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                            className="mb-2 px-4 py-2 rounded-lg bg-[#0f1724] border border-gray-800 text-white w-full"
                        />

                        <div className="flex items-center justify-between mb-3 w-full">
                            <label className="text-gray-300 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={newUser.is_admin}
                                    onChange={(e) => setNewUser({...newUser, is_admin: e.target.checked})}
                                    className="accent-pink-600"
                                />
                                Is Admin
                            </label>
                            <label className="text-gray-300 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={newUser.is_active}
                                    onChange={(e) => setNewUser({...newUser, is_active: e.target.checked})}
                                    className="accent-green-600"
                                />
                                Active
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleCreateUser}
                                className="bg-pink-600 px-4 py-2 rounded-lg text-white font-semibold hover:bg-pink-700 transition"
                            >
                                Create User
                            </button>

                            <button onClick={closeModal}
                                    className="px-4 py-2 rounded-lg bg-[#141621] text-gray-300 hover:bg-[#1b2129]">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* EDIT */}
                {modalType === "edit" && selectedUser && (
                    <div className="space-y-3 w-full">
                        <input
                            type="text"
                            placeholder="Username"
                            value={selectedUser.username}
                            onChange={(e) => setSelectedUser({...selectedUser, username: e.target.value})}
                            className="mb-2 px-4 py-2 rounded-lg bg-[#0f1724] border border-gray-800 text-white w-full"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={selectedUser.email}
                            onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                            className="mb-2 px-4 py-2 rounded-lg bg-[#0f1724] border border-gray-800 text-white w-full"
                        />

                        <div className="flex items-center justify-between mb-3 w-full">
                            <label className="text-gray-300 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedUser.is_admin}
                                    onChange={(e) => setSelectedUser({...selectedUser, is_admin: e.target.checked})}
                                    className="accent-pink-600"
                                />
                                Is Admin
                            </label>

                            <label className="text-gray-300 flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={selectedUser.is_active}
                                    onChange={(e) => setSelectedUser({
                                        ...selectedUser,
                                        is_active: e.target.checked
                                    })}
                                    className="accent-green-600"
                                />
                                Active
                            </label>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleUpdateUser}
                                className="bg-pink-600 px-4 py-2 rounded-lg text-white font-semibold hover:bg-pink-700 transition"
                            >
                                Save Changes
                            </button>

                            <button onClick={closeModal}
                                    className="px-4 py-2 rounded-lg bg-[#141621] text-gray-300 hover:bg-[#1b2129]">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* DETAIL */}
                {modalType === "detail" && userDetail && (
                    <div className="w-full text-gray-200 space-y-6">
                        {/* USER INFO */}
                        <div
                            className="bg-gradient-to-br from-[#0b0f17] via-[#111827] to-[#1a1f2b] border border-[#2c2f3a] rounded-2xl p-5 shadow-lg">
                            <h3 className="text-lg font-bold text-cyan-400 mb-3">👤 User Information</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><span className="text-gray-400">Access ID:</span> <b>{userDetail.access_id}</b>
                                </div>
                                <div><span
                                    className="text-gray-400">Created:</span> {new Date(userDetail.created_at).toLocaleString()}
                                </div>
                                <div><span
                                    className="text-gray-400">Last Login:</span> {new Date(userDetail.last_login).toLocaleString()}
                                </div>
                                <div><span
                                    className="text-gray-400">Using TOTP:</span> {userDetail.using_totp ? "Yes" : "No"}
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-400">Secret:</span>
                                    <span className="font-mono text-white ml-2">{userDetail.secret}</span>
                                </div>
                            </div>
                        </div>

                        {/* MY PLAN */}
                        <div
                            className="bg-gradient-to-br from-[#0b1116] to-[#111b26] border border-cyan-800 rounded-2xl p-5 shadow-md">
                            <h3 className="text-lg font-semibold text-cyan-300 mb-3">📦 My Plan</h3>
                            {userDetail.myPlan ? (
                                <div className="grid grid-cols-2 gap-3 text-sm">
                                    <div><b>Breach:</b> {userDetail.myPlan.breach}</div>
                                    <div><b>Current Breach:</b> {userDetail.myPlan.current_breach}</div>
                                    <div><b>Domain:</b> {userDetail.myPlan.domain}</div>
                                    <div><b>Expired:</b> {new Date(userDetail.myPlan.expired).toLocaleString()}</div>
                                    <div className="col-span-2">
                                        <b>Registered Domains:</b>
                                        <ul className="list-disc ml-5 mt-1 space-y-1">
                                            {userDetail.myPlan.registered_domain?.map((d, i) => (
                                                <li key={i}>{d}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic">No active plan</p>
                            )}
                        </div>

                        {/* TRANSACTIONS */}
                        <div
                            className="bg-gradient-to-br from-[#141424] to-[#1b1b2a] border border-pink-700 rounded-2xl p-5 shadow-md">
                            <h3 className="text-lg font-semibold text-pink-300 mb-3">💳 Transactions</h3>
                            {userDetail.transaction?.length ? (
                                userDetail.transaction.map((t, i) => (
                                    <div key={i} className="border-t border-gray-800 pt-3 mt-3 text-sm">
                                        <div><b>Plan:</b> {t.plan}</div>
                                        <div><b>Domain:</b> {t.domain}</div>
                                        <div><b>Invoice ID:</b> {t.invoice?.Id || "-"}</div>
                                        <div><b>Amount:</b> {t.payment?.Amount} {t.payment?.AssetCode?.toUpperCase()}
                                        </div>
                                        <div><b>Network:</b> {t.payment?.BlockchainCode}</div>
                                        <div>
                                            <b>Status:</b>{" "}
                                            {t.payment?.Status === 0 ? (
                                                <span className="text-yellow-400 font-semibold">Pending</span>
                                            ) : (
                                                <span className="text-green-400 font-semibold">Paid</span>
                                            )}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 italic">No transactions found</p>
                            )}
                        </div>

                        {/* LOGIN HISTORY */}
                        <div
                            className="bg-gradient-to-br from-[#0f1724] to-[#1b1b2a] border border-gray-800 rounded-2xl p-5 shadow-md">
                            <h3 className="text-lg font-semibold text-yellow-300 mb-3">🕓 Login History</h3>
                            <div className="overflow-hidden rounded-xl border border-gray-700">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#1c1c2e] text-gray-300 uppercase text-xs">
                                    <tr>
                                        <th className="p-2 text-left">IP Address</th>
                                        <th className="p-2 text-left">Timestamp</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    {userDetail.login_history?.map((l, i) => (
                                        <tr key={i} className="hover:bg-[#11151b] transition">
                                            <td className="p-2">{l.ip_address}</td>
                                            <td className="p-2">{new Date(l.timestamp).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="flex flex-col sm:flex-row gap-3 mt-6">
                            {userDetail.is_admin ? (
                                <button
                                    onClick={() => handleRemoveAdmin(userDetail)}
                                    className="flex-1 bg-gradient-to-r from-[#f03262] to-[#6b21a8] hover:from-[#c91d4e] hover:to-[#5b1788] px-4 py-2 rounded-lg font-semibold shadow-md transition-all"
                                >
                                    ❌ Remove Admin
                                </button>
                            ) : (
                                <button
                                    onClick={() => handleMakeAdmin(userDetail)}
                                    className="flex-1 bg-gradient-to-r from-[#0ff] to-[#00c9ff] hover:from-[#00c9ff] hover:to-[#0ff] px-4 py-2 rounded-lg font-semibold text-gray-900 shadow-md transition-all"
                                >
                                    👑 Make Admin
                                </button>
                            )}
                            <button
                                onClick={closeModal}
                                className="flex-1 bg-[#232339] hover:bg-[#2b2b45] px-4 py-2 rounded-lg text-white font-semibold transition-all"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}


                {/* ASSIGN (Manage admin role) */}
                {modalType === "assign" && selectedUser && (
                    <div className="w-full space-y-3">
                        <p className="text-gray-300">Manage admin role for <span
                            className="text-cyan-300 font-semibold">{selectedUser.username}</span></p>

                        <div className="grid grid-cols-1 gap-2">
                            <button
                                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-semibold"
                                onClick={() => handleMakeAdmin(selectedUser)}
                            >
                                Make Admin
                            </button>

                            <button
                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold"
                                onClick={() => handleRemoveAdmin(selectedUser)}
                            >
                                Remove Admin
                            </button>

                            <button className="px-4 py-2 rounded-lg bg-[#141621] text-gray-300 hover:bg-[#1b2129]"
                                    onClick={closeModal}>
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* DELETE */}
                {modalType === "delete" && selectedUser && (
                    <div className="w-full space-y-3">
                        <p className="text-gray-300">Are you sure you want to delete <span
                            className="text-white font-semibold">{selectedUser.username}</span>? This action cannot be
                            undone.</p>

                        <div className="flex gap-3">
                            <button
                                className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold"
                                onClick={() => handleDeleteUser(selectedUser)}
                            >
                                Delete
                            </button>

                            <button onClick={closeModal}
                                    className="px-4 py-2 rounded-lg bg-[#141621] text-gray-300 hover:bg-[#1b2129]">
                                Cancel
                            </button>
                        </div>
                    </div>
                )}

                {/* PLAN */}
                {modalType === "plan" && planDetail && (
                    <div className="w-full text-gray-300">
                        <div className="space-y-2">
                            <div><span className="text-gray-400">Plan ID:</span> <span
                                className="font-mono text-white ml-2">{planDetail.plan}</span></div>
                            <div><span className="text-gray-400">Breach Limit:</span> <span
                                className="font-semibold text-white ml-2">{planDetail.breach}</span></div>
                            <div><span className="text-gray-400">Current Breach:</span> <span
                                className="font-semibold text-pink-400 ml-2">{planDetail.current_breach}</span></div>
                            <div><span className="text-gray-400">Domain Limit:</span> <span
                                className="font-semibold text-white ml-2">{planDetail.domain}</span></div>
                            <div><span className="text-gray-400">Expired:</span> <span
                                className="font-semibold text-yellow-400 ml-2">{new Date(planDetail.expired).toLocaleString()}</span>
                            </div>

                            <div>
                                <span className="text-gray-400">Registered Domain:</span>
                                {planDetail.registered_domain?.length > 0 ? (
                                    <ul className="list-disc ml-5 mt-1 text-white">
                                        {planDetail.registered_domain.map((d, i) => <li key={i}>{d}</li>)}
                                    </ul>
                                ) : (
                                    <p className="italic text-gray-500">No domains registered</p>
                                )}
                            </div>
                        </div>

                        <div className="mt-4">
                            <button onClick={closeModal}
                                    className="w-full bg-cyan-600 px-4 py-2 rounded-lg text-white font-semibold hover:bg-cyan-700 transition">
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}