"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldCheck, BarChart3, Database, History, 
  Terminal, BookOpen, Plus, Trash2, Calendar, 
  Settings, Users as UsersIcon, Edit3, CheckCircle, XCircle 
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  
  // Dashboard view states
  const [activeTab, setActiveTab] = useState<"secops" | "courses" | "bookings" | "services" | "users">("secops");
  const [metrics, setMetrics] = useState({ 
    total_users: 0, 
    total_courses: 0, 
    total_enrollments: 0, 
    total_revenue: 0.0, 
    total_bookings: 0 
  });
  
  // Lists
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  
  // Status states
  const [fetching, setFetching] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Forms
  const [courseForm, setCourseForm] = useState({
    title: "",
    slug: "",
    description: "",
    short_description: "",
    price: 99.0,
    level: "beginner",
    duration_hours: 10
  });

  const [editServiceId, setEditServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState({
    title: "",
    description: "",
    base_price: 1500.0,
    estimated_days: 5
  });

  const showMessage = (text: string, type: "success" | "error" = "success") => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 5000);
  };

  const headers = { 
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json"
  };

  const fetchAllData = async () => {
    if (!token) return;
    setFetching(true);
    try {
      // 1. Metrics & Logs
      const metricsRes = await fetch("/api/v1/dashboard/admin/metrics", { headers });
      if (metricsRes.ok) setMetrics(await metricsRes.json());

      const logsRes = await fetch("/api/v1/dashboard/admin/audit-logs?page=1&page_size=25", { headers });
      if (logsRes.ok) {
        const body = await logsRes.json();
        setAuditLogs(body.items || []);
      }

      // 2. Courses
      const coursesRes = await fetch("/api/v1/courses?page=1&page_size=100", { headers });
      if (coursesRes.ok) {
        const body = await coursesRes.json();
        setCourses(body.items || []);
      }

      // 3. Bookings
      const bookingsRes = await fetch("/api/v1/bookings", { headers });
      if (bookingsRes.ok) {
        setBookings(await bookingsRes.json());
      }

      // 4. Services
      const servicesRes = await fetch("/api/v1/services", { headers });
      if (servicesRes.ok) {
        setServices(await servicesRes.json());
      }

      // 5. Users
      const usersRes = await fetch("/api/v1/users?page=1&page_size=100", { headers });
      if (usersRes.ok) {
        const body = await usersRes.json();
        setUsers(body.items || []);
      }
    } catch (err) {
      console.error("Dashboard hydration error:", err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (loading) return;
    if (!user || !user.roles.includes("admin")) {
      router.push("/login");
      return;
    }
    fetchAllData();
  }, [user, token, loading, router]);

  // Course handlers
  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/courses", {
        method: "POST",
        headers,
        body: JSON.stringify(courseForm)
      });
      if (res.ok) {
        showMessage("Course created successfully!");
        setCourseForm({
          title: "",
          slug: "",
          description: "",
          short_description: "",
          price: 99.0,
          level: "beginner",
          duration_hours: 10
        });
        fetchAllData();
      } else {
        const err = await res.json();
        showMessage(err.detail || "Failed to create course.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return;
    try {
      const res = await fetch(`/api/v1/courses/${id}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) {
        showMessage("Course deleted successfully.");
        fetchAllData();
      } else {
        showMessage("Failed to delete course.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    }
  };

  // User handlers
  const handleUpdateRole = async (userId: string, selectedRole: string) => {
    try {
      const res = await fetch(`/api/v1/users/${userId}/role`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ roles: [selectedRole] })
      });
      if (res.ok) {
        showMessage("User role updated successfully.");
        fetchAllData();
      } else {
        showMessage("Failed to update role.", "error");
      }
    } catch (err) {
      showMessage("Error updating role.", "error");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Are you sure you want to soft-delete this user?")) return;
    try {
      const res = await fetch(`/api/v1/users/${userId}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) {
        showMessage("User account deleted successfully.");
        fetchAllData();
      } else {
        showMessage("Failed to delete user.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    }
  };

  // Service handlers
  const handleEditServiceClick = (svc: any) => {
    setEditServiceId(svc.id);
    setServiceForm({
      title: svc.title,
      description: svc.description || "",
      base_price: svc.base_price,
      estimated_days: svc.estimated_days || 5
    });
  };

  const handleUpdateService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editServiceId) return;
    try {
      const res = await fetch(`/api/v1/services/${editServiceId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(serviceForm)
      });
      if (res.ok) {
        showMessage("Service catalog updated successfully!");
        setEditServiceId(null);
        fetchAllData();
      } else {
        showMessage("Failed to update service.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    }
  };

  if (loading || fetching) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "8rem 0" }}>
        <p style={{ color: "var(--text-secondary)" }}>Loading secure operations workspace...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "3rem 0", minHeight: "80vh" }}>
      <div className="container">
        
        {/* Banner */}
        <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2.5rem", marginBottom: "2rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--accent-violet)" }}>
            <ShieldCheck size={20} />
            <span style={{ fontWeight: 600, fontSize: "0.85rem", textTransform: "uppercase" }}>Security Operations (SecOps)</span>
          </div>
          <h1 style={{ fontSize: "2rem", fontWeight: 800, marginTop: "0.25rem" }}>Platform Operations Center</h1>
          <p style={{ color: "var(--text-secondary)" }}>Interactive administrative overrides and audit log monitoring</p>
        </div>

        {/* Action Message Alert */}
        {actionMessage && (
          <div style={{
            background: actionMessage.type === "success" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
            color: actionMessage.type === "success" ? "var(--accent-emerald)" : "#ef4444",
            padding: "1rem",
            borderRadius: "var(--radius-md)",
            border: `1px solid ${actionMessage.type === "success" ? "rgba(16, 185, 129, 0.2)" : "rgba(239, 68, 68, 0.2)"}`,
            marginBottom: "2rem",
            fontWeight: 600
          }}>
            {actionMessage.text}
          </div>
        )}

        {/* Tab Selection Row */}
        <div style={{ display: "flex", gap: "1rem", borderBottom: "1px solid var(--border-color)", marginBottom: "2.5rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
          <button 
            onClick={() => setActiveTab("secops")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "secops" ? "var(--text-primary)" : "transparent",
              color: activeTab === "secops" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <BarChart3 size={18} />
            <span>SecOps Overview</span>
          </button>
          <button 
            onClick={() => setActiveTab("courses")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "courses" ? "var(--text-primary)" : "transparent",
              color: activeTab === "courses" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <BookOpen size={18} />
            <span>Course Manager</span>
          </button>
          <button 
            onClick={() => setActiveTab("bookings")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "bookings" ? "var(--text-primary)" : "transparent",
              color: activeTab === "bookings" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <Calendar size={18} />
            <span>Bookings</span>
          </button>
          <button 
            onClick={() => setActiveTab("services")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "services" ? "var(--text-primary)" : "transparent",
              color: activeTab === "services" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <Settings size={18} />
            <span>Service CMS</span>
          </button>
          <button 
            onClick={() => setActiveTab("users")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "users" ? "var(--text-primary)" : "transparent",
              color: activeTab === "users" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <UsersIcon size={18} />
            <span>User Directory</span>
          </button>
        </div>

        {/* Tab 1: SecOps Overview */}
        {activeTab === "secops" && (
          <div>
            {/* Metrics Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "2rem", marginBottom: "4rem" }}>
              <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Total Users</span>
                <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", marginTop: "0.25rem" }}>{metrics.total_users}</h3>
              </div>
              <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Active Courses</span>
                <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-blue)", marginTop: "0.25rem" }}>{metrics.total_courses}</h3>
              </div>
              <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Enrollments</span>
                <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-teal)", marginTop: "0.25rem" }}>{metrics.total_enrollments}</h3>
              </div>
              <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Consultations</span>
                <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-violet)", marginTop: "0.25rem" }}>{metrics.total_bookings}</h3>
              </div>
              <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "12px", padding: "1.5rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase" }}>Total Revenue</span>
                <h3 style={{ fontSize: "2rem", fontWeight: 800, color: "var(--accent-emerald)", marginTop: "0.25rem" }}>
                  ${metrics.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
            </div>

            {/* Audit Logs Table */}
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <History size={22} style={{ color: "var(--text-primary)" }} /> Audit log stream
              </h2>
              <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
                {auditLogs.length === 0 ? (
                  <p style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                    No operations logs recorded yet.
                  </p>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                    <thead>
                      <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600 }}>
                        <th style={{ padding: "1rem" }}>Timestamp</th>
                        <th style={{ padding: "1rem" }}>Action</th>
                        <th style={{ padding: "1rem" }}>Actor ID</th>
                        <th style={{ padding: "1rem" }}>Resource Type</th>
                        <th style={{ padding: "1rem" }}>IP Address</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.map((log) => (
                        <tr key={log.id} style={{ borderBottom: "1px solid var(--border-color)", fontFamily: "monospace" }}>
                          <td style={{ padding: "1rem" }}>{new Date(log.timestamp).toLocaleString()}</td>
                          <td style={{ padding: "1rem", color: "var(--accent-blue)", fontWeight: 600 }}>{log.action}</td>
                          <td style={{ padding: "1rem" }}>{log.actor_id || "System"}</td>
                          <td style={{ padding: "1rem" }}>{log.resource_type}</td>
                          <td style={{ padding: "1rem" }}>{log.ip_address || "127.0.0.1"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Course Manager */}
        {activeTab === "courses" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "3rem" }}>
            
            {/* List */}
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Active Catalog</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {courses.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>No courses created yet.</p>
                ) : (
                  courses.map((course) => (
                    <div key={course.id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <span style={{ fontSize: "0.75rem", background: "rgba(14, 165, 233, 0.1)", color: "var(--accent-blue)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                            {course.level}
                          </span>
                          <span style={{ fontSize: "0.75rem", background: "rgba(16, 185, 129, 0.1)", color: "var(--accent-emerald)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                            {course.status}
                          </span>
                        </div>
                        <h4 style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: "0.5rem" }}>{course.title}</h4>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>{course.short_description || "No description provided."}</p>
                        <p style={{ fontWeight: 600, fontSize: "0.9rem", color: "var(--text-primary)", marginTop: "0.5rem" }}>
                          ${course.price} &bull; {course.duration_hours || 0} Hours
                        </p>
                      </div>
                      <button 
                        onClick={() => handleDeleteCourse(course.id)}
                        style={{ color: "#ef4444", padding: "0.5rem", background: "transparent", border: "none", cursor: "pointer" }}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Create Form */}
            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Plus size={20} /> Create Academy Course
              </h2>
              <form onSubmit={handleCreateCourse} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Course Title *</label>
                  <input 
                    type="text" 
                    required 
                    value={courseForm.title} 
                    onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} 
                    style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>URL Slug *</label>
                  <input 
                    type="text" 
                    required 
                    value={courseForm.slug} 
                    placeholder="e.g. offensive-security-basics"
                    onChange={(e) => setCourseForm({ ...courseForm, slug: e.target.value })} 
                    style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Short Summary *</label>
                  <input 
                    type="text" 
                    required 
                    value={courseForm.short_description} 
                    onChange={(e) => setCourseForm({ ...courseForm, short_description: e.target.value })} 
                    style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Detailed Description</label>
                  <textarea 
                    value={courseForm.description} 
                    rows={4}
                    onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} 
                    style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontFamily: "sans-serif" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Price (USD) *</label>
                    <input 
                      type="number" 
                      required 
                      value={courseForm.price} 
                      onChange={(e) => setCourseForm({ ...courseForm, price: parseFloat(e.target.value) })} 
                      style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Duration (Hours) *</label>
                    <input 
                      type="number" 
                      required 
                      value={courseForm.duration_hours} 
                      onChange={(e) => setCourseForm({ ...courseForm, duration_hours: parseFloat(e.target.value) })} 
                      style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Level</label>
                  <select 
                    value={courseForm.level} 
                    onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white" }}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-accent" style={{ marginTop: "1rem" }}>
                  <span>Deploy Course</span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* Tab 3: Bookings */}
        {activeTab === "bookings" && (
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Consultation Request Directory</h2>
            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              {bookings.length === 0 ? (
                <p style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>
                  No scheduled consultations found.
                </p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600 }}>
                      <th style={{ padding: "1rem" }}>Time Slot</th>
                      <th style={{ padding: "1rem" }}>Client Details</th>
                      <th style={{ padding: "1rem" }}>Organization</th>
                      <th style={{ padding: "1rem" }}>Topic / Scope</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "1rem", fontWeight: 600 }}>
                          {new Date(booking.scheduled_time).toLocaleString()}
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ fontWeight: 600 }}>{booking.client_name}</div>
                          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{booking.client_email}</div>
                        </td>
                        <td style={{ padding: "1rem" }}>{booking.company_name || "Self-employed"}</td>
                        <td style={{ padding: "1rem" }}>{booking.notes || "Not specified."}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Service Catalog (CMS) */}
        {activeTab === "services" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "3rem" }}>
            
            {/* List */}
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Services Listing</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {services.map((svc) => (
                  <div key={svc.id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <h4 style={{ fontWeight: 700, fontSize: "1.1rem" }}>{svc.title}</h4>
                        <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>{svc.slug}</p>
                      </div>
                      <button 
                        onClick={() => handleEditServiceClick(svc)}
                        style={{ color: "var(--accent-blue)", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 600 }}
                      >
                        <Edit3 size={16} />
                        <span>Edit</span>
                      </button>
                    </div>
                    <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.75rem" }}>{svc.description}</p>
                    <div style={{ display: "flex", gap: "1.5rem", marginTop: "1rem", borderTop: "1px solid #f1f5f9", paddingTop: "0.75rem", fontSize: "0.85rem", fontWeight: 600 }}>
                      <span style={{ color: "var(--accent-teal)" }}>Base Rate: ${svc.base_price}</span>
                      <span style={{ color: "var(--accent-violet)" }}>Estimated Days: {svc.estimated_days || 5} Days</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Edit Panel */}
            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Settings size={20} /> Service Configurator
              </h2>
              
              {!editServiceId ? (
                <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "3rem 0" }}>
                  Select a service from the left list to modify its pricing and scope parameters.
                </p>
              ) : (
                <form onSubmit={handleUpdateService} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Title</label>
                    <input 
                      type="text" 
                      required 
                      value={serviceForm.title} 
                      onChange={(e) => setServiceForm({ ...serviceForm, title: e.target.value })} 
                      style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Description</label>
                    <textarea 
                      required 
                      rows={4}
                      value={serviceForm.description} 
                      onChange={(e) => setServiceForm({ ...serviceForm, description: e.target.value })} 
                      style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontFamily: "sans-serif" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Base Price (USD)</label>
                    <input 
                      type="number" 
                      required 
                      value={serviceForm.base_price} 
                      onChange={(e) => setServiceForm({ ...serviceForm, base_price: parseFloat(e.target.value) })} 
                      style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Estimated Duration (Days)</label>
                    <input 
                      type="number" 
                      required 
                      value={serviceForm.estimated_days} 
                      onChange={(e) => setServiceForm({ ...serviceForm, estimated_days: parseInt(e.target.value) })} 
                      style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }}
                    />
                  </div>
                  <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
                    <button type="submit" className="btn btn-accent" style={{ flex: 1 }}>
                      <span>Save Changes</span>
                    </button>
                    <button type="button" onClick={() => setEditServiceId(null)} className="btn btn-outline" style={{ flex: 1 }}>
                      <span>Cancel</span>
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>
        )}

        {/* Tab 5: User Directory */}
        {activeTab === "users" && (
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Registered User Profiles</h2>
            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                <thead>
                  <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600 }}>
                    <th style={{ padding: "1rem" }}>Full Name</th>
                    <th style={{ padding: "1rem" }}>Email</th>
                    <th style={{ padding: "1rem" }}>Roles</th>
                    <th style={{ padding: "1rem" }}>States</th>
                    <th style={{ padding: "1rem" }}>Action Override</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <td style={{ padding: "1rem", fontWeight: 600 }}>{u.full_name}</td>
                      <td style={{ padding: "1rem", fontFamily: "monospace" }}>{u.email}</td>
                      <td style={{ padding: "1rem" }}>
                        <select 
                          value={u.roles[0] || "student"} 
                          onChange={(e) => handleUpdateRole(u.id, e.target.value)}
                          style={{ padding: "0.3rem 0.6rem", border: "1px solid var(--border-color)", borderRadius: "4px", background: "white", fontSize: "0.85rem", fontWeight: 600 }}
                        >
                          <option value="student">Student</option>
                          <option value="instructor">Instructor</option>
                          <option value="corporate_client">Corporate Client</option>
                          <option value="admin">Administrator</option>
                        </select>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", gap: "1rem" }}>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: u.is_verified ? "var(--accent-emerald)" : "var(--text-muted)" }}>
                            {u.is_verified ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            <span>Verified</span>
                          </span>
                          <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: u.is_active ? "var(--accent-emerald)" : "#ef4444" }}>
                            {u.is_active ? <CheckCircle size={16} /> : <XCircle size={16} />}
                            <span>Active</span>
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {u.id !== user?.id ? (
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            style={{ color: "#ef4444", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 600, fontSize: "0.85rem" }}
                          >
                            <Trash2 size={16} />
                            <span>Delete</span>
                          </button>
                        ) : (
                          <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Self (Current Actor)</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
