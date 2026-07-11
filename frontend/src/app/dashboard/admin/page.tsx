"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  ShieldCheck, BarChart3, Database, History, 
  Terminal, BookOpen, Plus, Trash2, Calendar, 
  Settings, Users as UsersIcon, Edit3, CheckCircle, XCircle,
  FileText, Award, Layers, HelpCircle, MessageSquare
} from "lucide-react";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, token, loading } = useAuth();
  
  // Dashboard view states
  const [activeTab, setActiveTab] = useState<"secops" | "courses" | "bookings" | "services" | "users" | "blog" | "research" | "careers" | "contacts" | "tickets" | "enrollments" | "certificates" | "cohorts">("secops");
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
  const [blogs, setBlogs] = useState<any[]>([]);
  const [research, setResearch] = useState<any[]>([]);
  const [careers, setCareers] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [cohorts, setCohorts] = useState<any[]>([]);
  
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

  const [blogForm, setBlogForm] = useState({ title: "", slug: "", content: "", excerpt: "", status: "draft" });
  const [editBlogId, setEditBlogId] = useState<string | null>(null);

  const [researchForm, setResearchForm] = useState({ title: "", slug: "", abstract: "", type: "whitepaper", cve_id: "", status: "draft" });

  const [careerForm, setCareerForm] = useState({ title: "", slug: "", department: "", location: "", type: "Full-Time", description: "", requirements: "", status: "draft" });
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [ticketReplyBody, setTicketReplyBody] = useState("");
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);

  const [cohortForm, setCohortForm] = useState({ course_id: "", title: "", start_date: "", end_date: "", capacity: 30, instructor_id: "" });

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

      // 6. Blogs
      const blogsRes = await fetch("/api/v1/blog?page=1&page_size=100", { headers });
      if (blogsRes.ok) {
        const body = await blogsRes.json();
        setBlogs(body.items || []);
      }

      // 7. Research
      const researchRes = await fetch("/api/v1/research", { headers });
      if (researchRes.ok) {
        setResearch(await researchRes.json());
      }

      // 8. Careers
      const careersRes = await fetch("/api/v1/careers", { headers });
      if (careersRes.ok) {
        setCareers(await careersRes.json());
      }

      // 9. Contacts & Quotes
      const contactsRes = await fetch("/api/v1/contacts", { headers });
      if (contactsRes.ok) {
        setContacts(await contactsRes.json());
      }

      const quotesRes = await fetch("/api/v1/contacts/quotes", { headers });
      if (quotesRes.ok) {
        setQuotes(await quotesRes.json());
      }

      // 10. Support Tickets
      const ticketsRes = await fetch("/api/v1/tickets", { headers });
      if (ticketsRes.ok) {
        setTickets(await ticketsRes.json());
      }

      // 11. Enrollments
      const enrollmentsRes = await fetch("/api/v1/enrollments", { headers });
      if (enrollmentsRes.ok) {
        setEnrollments(await enrollmentsRes.json());
      }

      // 12. Certificates
      const certsRes = await fetch("/api/v1/certificates", { headers });
      if (certsRes.ok) {
        setCertificates(await certsRes.json());
      }

      // 13. Cohorts
      const cohortsRes = await fetch("/api/v1/cohorts", { headers });
      if (cohortsRes.ok) {
        setCohorts(await cohortsRes.json());
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

  // Blog Handlers
  const handleCreateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/blog", {
        method: "POST",
        headers,
        body: JSON.stringify(blogForm)
      });
      if (res.ok) {
        showMessage("Blog post created successfully!");
        setBlogForm({ title: "", slug: "", content: "", excerpt: "", status: "draft" });
        fetchAllData();
      } else {
        const err = await res.json();
        showMessage(err.detail || "Failed to create post.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    }
  };

  const handleDeleteBlog = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return;
    try {
      const res = await fetch(`/api/v1/blog/${id}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) {
        showMessage("Blog post deleted successfully.");
        fetchAllData();
      } else {
        showMessage("Failed to delete post.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    }
  };

  const handleEditBlogClick = (post: any) => {
    setEditBlogId(post.id);
    setBlogForm({
      title: post.title,
      slug: post.slug,
      content: post.content || "",
      excerpt: post.excerpt || "",
      status: post.status
    });
  };

  const handleUpdateBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editBlogId) return;
    try {
      const res = await fetch(`/api/v1/blog/${editBlogId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(blogForm)
      });
      if (res.ok) {
        showMessage("Blog post updated successfully!");
        setEditBlogId(null);
        setBlogForm({ title: "", slug: "", content: "", excerpt: "", status: "draft" });
        fetchAllData();
      } else {
        showMessage("Failed to update blog post.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    }
  };

  // Research Handlers
  const handleCreateResearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/research", {
        method: "POST",
        headers,
        body: JSON.stringify(researchForm)
      });
      if (res.ok) {
        showMessage("Research publication added successfully!");
        setResearchForm({ title: "", slug: "", abstract: "", type: "whitepaper", cve_id: "", status: "draft" });
        fetchAllData();
      } else {
        const err = await res.json();
        showMessage(err.detail || "Failed to create publication.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    }
  };

  const handleDeleteResearch = async (id: string) => {
    if (!confirm("Are you sure you want to delete this publication?")) return;
    try {
      const res = await fetch(`/api/v1/research/${id}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) {
        showMessage("Research publication deleted successfully.");
        fetchAllData();
      } else {
        showMessage("Failed to delete publication.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    }
  };

  // Careers Handlers
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/careers", {
        method: "POST",
        headers,
        body: JSON.stringify(careerForm)
      });
      if (res.ok) {
        showMessage("Job posting created successfully!");
        setCareerForm({ title: "", slug: "", department: "", location: "", type: "Full-Time", description: "", requirements: "", status: "draft" });
        fetchAllData();
      } else {
        const err = await res.json();
        showMessage(err.detail || "Failed to create job posting.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm("Are you sure you want to delete this job posting?")) return;
    try {
      const res = await fetch(`/api/v1/careers/${id}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) {
        showMessage("Job posting deleted.");
        setSelectedJobId(null);
        setApplications([]);
        fetchAllData();
      } else {
        showMessage("Failed to delete job posting.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    }
  };

  const handleViewApplications = async (jobId: string) => {
    setSelectedJobId(jobId);
    try {
      const res = await fetch(`/api/v1/careers/${jobId}/applications`, { headers });
      if (res.ok) {
        setApplications(await res.json());
      } else {
        showMessage("Failed to fetch applications.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    }
  };

  // Ticket Handlers
  const handleSelectTicket = (ticket: any) => {
    setSelectedTicket(ticket);
  };

  const handleReplyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyBody.trim()) return;
    try {
      const res = await fetch(`/api/v1/tickets/${selectedTicket.id}/replies`, {
        method: "POST",
        headers,
        body: JSON.stringify({ body: ticketReplyBody })
      });
      if (res.ok) {
        showMessage("Reply posted successfully!");
        setTicketReplyBody("");
        // Reload all tickets, and update selected ticket view
        const ticketsRes = await fetch("/api/v1/tickets", { headers });
        if (ticketsRes.ok) {
          const freshTickets = await ticketsRes.json();
          setTickets(freshTickets);
          const updated = freshTickets.find((t: any) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      } else {
        showMessage("Failed to post reply.", "error");
      }
    } catch (err) {
      showMessage("Error posting reply.", "error");
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: string, priority: string) => {
    try {
      const res = await fetch(`/api/v1/tickets/${ticketId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify({ status, priority })
      });
      if (res.ok) {
        showMessage("Ticket status updated.");
        // Reload tickets
        const ticketsRes = await fetch("/api/v1/tickets", { headers });
        if (ticketsRes.ok) {
          const freshTickets = await ticketsRes.json();
          setTickets(freshTickets);
          const updated = freshTickets.find((t: any) => t.id === ticketId);
          if (updated) setSelectedTicket(updated);
        }
      } else {
        showMessage("Failed to update status.", "error");
      }
    } catch (err) {
      showMessage("Error updating ticket.", "error");
    }
  };

  // Enrollments Handlers
  const handleDeleteEnrollment = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to cancel this student's enrollment?")) return;
    try {
      const res = await fetch(`/api/v1/enrollments/${enrollmentId}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) {
        showMessage("Enrollment cancelled successfully.");
        fetchAllData();
      } else {
        showMessage("Failed to cancel enrollment.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    }
  };

  // Cohorts Handlers
  const handleCreateCohort = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/v1/cohorts", {
        method: "POST",
        headers,
        body: JSON.stringify(cohortForm)
      });
      if (res.ok) {
        showMessage("Cohort created successfully!");
        setCohortForm({ course_id: "", title: "", start_date: "", end_date: "", capacity: 30, instructor_id: "" });
        fetchAllData();
      } else {
        const err = await res.json();
        showMessage(err.detail || "Failed to create cohort.", "error");
      }
    } catch (err) {
      showMessage("Error connecting to server.", "error");
    }
  };

  const handleDeleteCohort = async (cohortId: string) => {
    if (!confirm("Are you sure you want to delete this cohort?")) return;
    try {
      const res = await fetch(`/api/v1/cohorts/${cohortId}`, {
        method: "DELETE",
        headers
      });
      if (res.ok) {
        showMessage("Cohort deleted successfully.");
        fetchAllData();
      } else {
        showMessage("Failed to delete cohort.", "error");
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
          <button 
            onClick={() => setActiveTab("blog")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "blog" ? "var(--text-primary)" : "transparent",
              color: activeTab === "blog" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <FileText size={18} />
            <span>Blog CMS</span>
          </button>
          <button 
            onClick={() => setActiveTab("research")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "research" ? "var(--text-primary)" : "transparent",
              color: activeTab === "research" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <Terminal size={18} />
            <span>Research</span>
          </button>
          <button 
            onClick={() => setActiveTab("careers")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "careers" ? "var(--text-primary)" : "transparent",
              color: activeTab === "careers" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <Layers size={18} />
            <span>Careers CMS</span>
          </button>
          <button 
            onClick={() => setActiveTab("contacts")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "contacts" ? "var(--text-primary)" : "transparent",
              color: activeTab === "contacts" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <MessageSquare size={18} />
            <span>Inbox</span>
          </button>
          <button 
            onClick={() => setActiveTab("tickets")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "tickets" ? "var(--text-primary)" : "transparent",
              color: activeTab === "tickets" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <HelpCircle size={18} />
            <span>Support Desk</span>
          </button>
          <button 
            onClick={() => setActiveTab("enrollments")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "enrollments" ? "var(--text-primary)" : "transparent",
              color: activeTab === "enrollments" ? "white" : "var(--text-secondary)",
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
            <span>Enrollments</span>
          </button>
          <button 
            onClick={() => setActiveTab("certificates")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "certificates" ? "var(--text-primary)" : "transparent",
              color: activeTab === "certificates" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <Award size={18} />
            <span>Certificates</span>
          </button>
          <button 
            onClick={() => setActiveTab("cohorts")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "cohorts" ? "var(--text-primary)" : "transparent",
              color: activeTab === "cohorts" ? "white" : "var(--text-secondary)",
              border: "none",
              borderRadius: "var(--radius-md)",
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}
          >
            <Database size={18} />
            <span>Cohorts</span>
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
                  ৳{metrics.total_revenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} BDT
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
                          ৳{course.price} BDT &bull; {course.duration_hours || 0} Hours
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
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Price (BDT) *</label>
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
                      <span style={{ color: "var(--accent-teal)" }}>Base Rate: ৳{svc.base_price} BDT</span>
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
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Base Price (BDT)</label>
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

        {/* Tab 6: Blog CMS */}
        {activeTab === "blog" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "3rem" }}>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Blog Post Directory</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {blogs.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>No blog articles created yet.</p>
                ) : (
                  blogs.map((post) => (
                    <div key={post.id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <span style={{ fontSize: "0.75rem", background: post.status === "published" ? "rgba(16, 185, 129, 0.1)" : "rgba(148, 163, 184, 0.1)", color: post.status === "published" ? "var(--accent-emerald)" : "var(--text-muted)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                            {post.status.toUpperCase()}
                          </span>
                        </div>
                        <h4 style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: "0.5rem" }}>{post.title}</h4>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>{post.excerpt || "No summary provided."}</p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Slug: {post.slug}</p>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button 
                          onClick={() => handleEditBlogClick(post)}
                          style={{ color: "var(--accent-blue)", padding: "0.5rem", background: "transparent", border: "none", cursor: "pointer" }}
                        >
                          <Edit3 size={18} />
                        </button>
                        <button 
                          onClick={() => handleDeleteBlog(post.id)}
                          style={{ color: "#ef4444", padding: "0.5rem", background: "transparent", border: "none", cursor: "pointer" }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>
                {editBlogId ? "Edit Blog Article" : "Create Blog Article"}
              </h2>
              <form onSubmit={editBlogId ? handleUpdateBlog : handleCreateBlog} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Title *</label>
                  <input type="text" required value={blogForm.title} onChange={(e) => setBlogForm({ ...blogForm, title: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Slug *</label>
                  <input type="text" required value={blogForm.slug} placeholder="e.g. secure-agent-architectures" onChange={(e) => setBlogForm({ ...blogForm, slug: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Excerpt *</label>
                  <input type="text" required value={blogForm.excerpt} onChange={(e) => setBlogForm({ ...blogForm, excerpt: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Content (Markdown supported) *</label>
                  <textarea required value={blogForm.content} rows={8} onChange={(e) => setBlogForm({ ...blogForm, content: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontFamily: "monospace" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Status</label>
                  <select value={blogForm.status} onChange={(e) => setBlogForm({ ...blogForm, status: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white" }}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button type="submit" className="btn btn-accent" style={{ flex: 1 }}>
                    <span>{editBlogId ? "Save Changes" : "Publish Post"}</span>
                  </button>
                  {editBlogId && (
                    <button type="button" onClick={() => { setEditBlogId(null); setBlogForm({ title: "", slug: "", content: "", excerpt: "", status: "draft" }); }} className="btn btn-outline" style={{ flex: 1 }}>
                      <span>Cancel</span>
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab 7: Research Hub */}
        {activeTab === "research" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "3rem" }}>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Publications Directory</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {research.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>No publications released yet.</p>
                ) : (
                  research.map((pub) => (
                    <div key={pub.id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <span style={{ fontSize: "0.75rem", background: "rgba(139, 92, 246, 0.1)", color: "var(--accent-violet)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                            {pub.type.toUpperCase()}
                          </span>
                          {pub.cve_id && (
                            <span style={{ fontSize: "0.75rem", background: "rgba(239, 68, 68, 0.1)", color: "#ef4444", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                              {pub.cve_id}
                            </span>
                          )}
                        </div>
                        <h4 style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: "0.5rem" }}>{pub.title}</h4>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>{pub.abstract || "No abstract provided."}</p>
                        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>Slug: {pub.slug}</p>
                      </div>
                      <button 
                        onClick={() => handleDeleteResearch(pub.id)}
                        style={{ color: "#ef4444", padding: "0.5rem", background: "transparent", border: "none", cursor: "pointer" }}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>Add Publication</h2>
              <form onSubmit={handleCreateResearch} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Title *</label>
                  <input type="text" required value={researchForm.title} onChange={(e) => setResearchForm({ ...researchForm, title: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Slug *</label>
                  <input type="text" required value={researchForm.slug} placeholder="e.g. cve-2026-auth-bypass" onChange={(e) => setResearchForm({ ...researchForm, slug: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Type *</label>
                  <select value={researchForm.type} onChange={(e) => setResearchForm({ ...researchForm, type: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white" }}>
                    <option value="whitepaper">Whitepaper</option>
                    <option value="advisory">Security Advisory</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>CVE ID (Optional)</label>
                  <input type="text" value={researchForm.cve_id} placeholder="e.g. CVE-2026-10291" onChange={(e) => setResearchForm({ ...researchForm, cve_id: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Abstract *</label>
                  <textarea required value={researchForm.abstract} rows={6} onChange={(e) => setResearchForm({ ...researchForm, abstract: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontFamily: "sans-serif" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Publishing Status</label>
                  <select value={researchForm.status} onChange={(e) => setResearchForm({ ...researchForm, status: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white" }}>
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-accent" style={{ marginTop: "1rem" }}>
                  <span>Add Publication</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Tab 8: Careers CMS */}
        {activeTab === "careers" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "3rem" }}>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Careers Directory</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {careers.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>No job listings created yet.</p>
                ) : (
                  careers.map((job) => (
                    <div key={job.id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <span style={{ fontSize: "0.75rem", background: "rgba(13, 148, 136, 0.1)", color: "var(--accent-teal)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                            {job.department}
                          </span>
                          <span style={{ fontSize: "0.75rem", background: "var(--bg-secondary)", color: "var(--text-secondary)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                            {job.type}
                          </span>
                        </div>
                        <h4 style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: "0.5rem" }}>{job.title}</h4>
                        <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>{job.location}</p>
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem" }}>
                        <button 
                          onClick={() => handleViewApplications(job.id)}
                          style={{ fontSize: "0.8rem", color: "var(--accent-blue)", padding: "0.4rem 0.8rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white", fontWeight: 600, cursor: "pointer" }}
                        >
                          Applications
                        </button>
                        <button 
                          onClick={() => handleDeleteJob(job.id)}
                          style={{ color: "#ef4444", padding: "0.5rem", background: "transparent", border: "none", cursor: "pointer" }}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2rem" }}>
              {selectedJobId ? (
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                    <h2 style={{ fontSize: "1.3rem", fontWeight: 700 }}>Applicants list</h2>
                    <button onClick={() => setSelectedJobId(null)} className="btn btn-outline" style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}>
                      Back to Form
                    </button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                    {applications.length === 0 ? (
                      <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "2rem 0" }}>No applications received yet.</p>
                    ) : (
                      applications.map((app) => (
                        <div key={app.id} style={{ border: "1px solid var(--border-color)", borderRadius: "8px", padding: "1rem" }}>
                          <div style={{ fontWeight: 700 }}>{app.name}</div>
                          <div style={{ color: "var(--text-secondary)", fontSize: "0.85rem" }}>{app.email}</div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem", fontSize: "0.8rem" }}>
                            <span style={{ fontWeight: 600, color: "var(--accent-blue)" }}>Status: {app.status}</span>
                            {app.resume_url && (
                              <a href={app.resume_url} target="_blank" rel="noreferrer" style={{ color: "var(--accent-teal)", textDecoration: "underline", fontWeight: 600 }}>
                                View Resume
                              </a>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div>
                  <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem" }}>Create Job Posting</h2>
                  <form onSubmit={handleCreateJob} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Job Title *</label>
                      <input type="text" required value={careerForm.title} onChange={(e) => setCareerForm({ ...careerForm, title: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Slug *</label>
                      <input type="text" required value={careerForm.slug} placeholder="e.g. senior-security-consultant" onChange={(e) => setCareerForm({ ...careerForm, slug: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Department *</label>
                      <input type="text" required value={careerForm.department} placeholder="e.g. Academy Operations" onChange={(e) => setCareerForm({ ...careerForm, department: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Location *</label>
                      <input type="text" required value={careerForm.location} placeholder="e.g. San Francisco, CA / Remote" onChange={(e) => setCareerForm({ ...careerForm, location: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Job Type</label>
                      <select value={careerForm.type} onChange={(e) => setCareerForm({ ...careerForm, type: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white" }}>
                        <option value="Full-Time">Full-Time</option>
                        <option value="Part-Time">Part-Time</option>
                        <option value="Contract">Contract</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Description *</label>
                      <textarea required value={careerForm.description} rows={6} onChange={(e) => setCareerForm({ ...careerForm, description: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontFamily: "sans-serif" }} />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Status</label>
                      <select value={careerForm.status} onChange={(e) => setCareerForm({ ...careerForm, status: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white" }}>
                        <option value="draft">Draft</option>
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-accent" style={{ marginTop: "1rem" }}>
                      <span>Add Job Posting</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 9: Inbox (Contact Form submissions & Quote requests) */}
        {activeTab === "contacts" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "3rem" }}>
            {/* Contact Submissions */}
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Contact Submissions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {contacts.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>No contact form messages received.</p>
                ) : (
                  contacts.map((c) => (
                    <div key={c.id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700 }}>{c.name}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{c.email}</span>
                      </div>
                      <h4 style={{ fontWeight: 600, fontSize: "1rem", marginTop: "0.5rem", color: "var(--accent-blue)" }}>{c.subject}</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.5rem" }}>{c.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Custom Quote Requests */}
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>B2B Quote Requests</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {quotes.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>No quote requests submitted yet.</p>
                ) : (
                  quotes.map((q) => (
                    <div key={q.id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1.5rem" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontWeight: 700 }}>{q.name}</span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{q.email}</span>
                      </div>
                      <div style={{ marginTop: "0.5rem" }}>
                        <span style={{ fontSize: "0.75rem", background: "rgba(139, 92, 246, 0.1)", color: "var(--accent-violet)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                          Service: {q.service_type.toUpperCase()}
                        </span>
                      </div>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.75rem" }}>
                        <strong>Details:</strong> {q.details}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 10: Support Desk */}
        {activeTab === "tickets" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "3rem" }}>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Tickets Inbox</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {tickets.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>No tickets opened.</p>
                ) : (
                  tickets.map((t) => (
                    <div 
                      key={t.id} 
                      onClick={() => handleSelectTicket(t)}
                      style={{ 
                        background: "white", 
                        border: selectedTicket?.id === t.id ? "2px solid var(--accent-blue)" : "1px solid var(--border-color)", 
                        borderRadius: "var(--radius-md)", 
                        padding: "1.5rem", 
                        cursor: "pointer" 
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "0.75rem", background: t.status === "open" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", color: t.status === "open" ? "#ef4444" : "var(--accent-emerald)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                          {t.status.toUpperCase()}
                        </span>
                        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                          Priority: {t.priority}
                        </span>
                      </div>
                      <h4 style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: "0.5rem" }}>{t.subject}</h4>
                      <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", marginTop: "0.25rem" }}>Created: {new Date(t.created_at).toLocaleString()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Ticket Details & Conversation</h2>
              {!selectedTicket ? (
                <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "4rem 2rem", textAlign: "center" }}>
                  <p style={{ color: "var(--text-muted)" }}>Select a support ticket from the inbox to manage overrides and post messages.</p>
                </div>
              ) : (
                <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem", marginBottom: "1.5rem" }}>
                    <div>
                      <h3 style={{ fontWeight: 700, fontSize: "1.25rem" }}>{selectedTicket.subject}</h3>
                      <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Ticket ID: {selectedTicket.id}</p>
                    </div>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <select 
                        value={selectedTicket.status} 
                        onChange={(e) => handleUpdateTicketStatus(selectedTicket.id, e.target.value, selectedTicket.priority)}
                        style={{ padding: "0.3rem", border: "1px solid var(--border-color)", borderRadius: "4px", fontSize: "0.85rem" }}
                      >
                        <option value="open">Open</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                  </div>

                  {/* Conversation thread */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "1rem", maxHeight: "350px", overflowY: "auto", marginBottom: "1.5rem", border: "1px solid var(--border-color)", borderRadius: "6px", padding: "1rem" }}>
                    {selectedTicket.replies.length === 0 ? (
                      <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", textAlign: "center" }}>No replies in this thread yet.</p>
                    ) : (
                      selectedTicket.replies.map((reply: any) => (
                        <div key={reply.id} style={{ alignSelf: reply.is_staff_reply ? "flex-end" : "flex-start", background: reply.is_staff_reply ? "rgba(14, 165, 233, 0.08)" : "#f8fafc", padding: "0.75rem 1rem", borderRadius: "8px", maxWidth: "80%" }}>
                          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.25rem" }}>
                            {reply.is_staff_reply ? "Staff Agent Override" : "User Client"} &bull; {new Date(reply.created_at).toLocaleTimeString()}
                          </div>
                          <p style={{ fontSize: "0.9rem", color: "var(--text-primary)" }}>{reply.body}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={handleReplyTicket}>
                    <textarea 
                      required
                      placeholder="Type staff response message..."
                      rows={3}
                      value={ticketReplyBody}
                      onChange={(e) => setTicketReplyBody(e.target.value)}
                      style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px", fontFamily: "sans-serif" }}
                    />
                    <button type="submit" className="btn btn-accent" style={{ width: "100%", marginTop: "0.75rem" }}>
                      <span>Send Reply</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 11: Enrollments */}
        {activeTab === "enrollments" && (
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Active Student Enrollments</h2>
            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              {enrollments.length === 0 ? (
                <p style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No enrollments found.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600 }}>
                      <th style={{ padding: "1rem" }}>Student</th>
                      <th style={{ padding: "1rem" }}>Course Track</th>
                      <th style={{ padding: "1rem" }}>Enrolled Date</th>
                      <th style={{ padding: "1rem" }}>Status</th>
                      <th style={{ padding: "1rem" }}>Action Override</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enrollments.map((e) => (
                      <tr key={e.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ fontWeight: 600 }}>{e.user_name}</div>
                          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{e.user_email}</div>
                        </td>
                        <td style={{ padding: "1rem", fontWeight: 600 }}>{e.course_title}</td>
                        <td style={{ padding: "1rem" }}>{new Date(e.enrolled_at).toLocaleDateString()}</td>
                        <td style={{ padding: "1rem" }}>
                          <span style={{ fontSize: "0.75rem", background: e.status === "completed" ? "rgba(16, 185, 129, 0.1)" : "rgba(14, 165, 233, 0.1)", color: e.status === "completed" ? "var(--accent-emerald)" : "var(--accent-blue)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                            {e.status.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ padding: "1rem" }}>
                          <button 
                            onClick={() => handleDeleteEnrollment(e.id)}
                            style={{ color: "#ef4444", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.25rem", fontWeight: 600, fontSize: "0.85rem" }}
                          >
                            <Trash2 size={16} />
                            <span>Cancel Enrollment</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 12: Certificates */}
        {activeTab === "certificates" && (
          <div>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Issued Practictioner Certificates</h2>
            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", overflow: "hidden" }}>
              {certificates.length === 0 ? (
                <p style={{ padding: "3rem", textAlign: "center", color: "var(--text-muted)" }}>No certificates generated yet.</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600 }}>
                      <th style={{ padding: "1rem" }}>Holder Name</th>
                      <th style={{ padding: "1rem" }}>Course Track</th>
                      <th style={{ padding: "1rem" }}>Verification ID</th>
                      <th style={{ padding: "1rem" }}>Issued Date</th>
                      <th style={{ padding: "1rem" }}>Certificate PDF</th>
                    </tr>
                  </thead>
                  <tbody>
                    {certificates.map((c) => (
                      <tr key={c.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                        <td style={{ padding: "1rem" }}>
                          <div style={{ fontWeight: 600 }}>{c.user_name}</div>
                          <div style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>{c.user_email}</div>
                        </td>
                        <td style={{ padding: "1rem", fontWeight: 600 }}>{c.course_title}</td>
                        <td style={{ padding: "1rem", fontFamily: "monospace" }}>{c.verification_id}</td>
                        <td style={{ padding: "1rem" }}>{new Date(c.issued_at).toLocaleDateString()}</td>
                        <td style={{ padding: "1rem" }}>
                          {c.pdf_url ? (
                            <a href={c.pdf_url} target="_blank" rel="noreferrer" style={{ color: "var(--accent-blue)", textDecoration: "underline", fontWeight: 600 }}>
                              Open PDF
                            </a>
                          ) : (
                            <span style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Generating...</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* Tab 13: Cohort Manager */}
        {activeTab === "cohorts" && (
          <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "3rem" }}>
            <div>
              <h2 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "1.5rem" }}>Training Cohorts</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {cohorts.length === 0 ? (
                  <p style={{ color: "var(--text-secondary)" }}>No training cohorts created yet.</p>
                ) : (
                  cohorts.map((cohort) => (
                    <div key={cohort.id} style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "1.5rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                          <span style={{ fontSize: "0.75rem", background: "rgba(14, 165, 233, 0.1)", color: "var(--accent-blue)", padding: "0.2rem 0.5rem", borderRadius: "4px", fontWeight: 600 }}>
                            Slots: {cohort.capacity} Students Max
                          </span>
                        </div>
                        <h4 style={{ fontWeight: 700, fontSize: "1.1rem", marginTop: "0.5rem" }}>{cohort.title}</h4>
                        <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>
                          <span>Start: {new Date(cohort.start_date).toLocaleDateString()}</span>
                          <span>End: {new Date(cohort.end_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteCohort(cohort.id)}
                        style={{ color: "#ef4444", padding: "0.5rem", background: "transparent", border: "none", cursor: "pointer" }}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div style={{ background: "white", border: "1px solid var(--border-color)", borderRadius: "var(--radius-md)", padding: "2rem" }}>
              <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Plus size={20} /> Create Cohort Batch
              </h2>
              <form onSubmit={handleCreateCohort} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Select Course Track *</label>
                  <select 
                    required 
                    value={cohortForm.course_id} 
                    onChange={(e) => setCohortForm({ ...cohortForm, course_id: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white" }}
                  >
                    <option value="">-- Select Course --</option>
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Select Assigned Instructor *</label>
                  <select 
                    required 
                    value={cohortForm.instructor_id} 
                    onChange={(e) => setCohortForm({ ...cohortForm, instructor_id: e.target.value })}
                    style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px", background: "white" }}
                  >
                    <option value="">-- Select Instructor --</option>
                    {users.filter((u: any) => u.roles.includes("instructor") || u.roles.includes("admin")).map((user) => (
                      <option key={user.id} value={user.id}>{user.full_name} ({user.email})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Cohort Title *</label>
                  <input type="text" required placeholder="e.g. Cohort Alpha 2026" value={cohortForm.title} onChange={(e) => setCohortForm({ ...cohortForm, title: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Start Date *</label>
                    <input type="date" required value={cohortForm.start_date} onChange={(e) => setCohortForm({ ...cohortForm, start_date: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>End Date *</label>
                    <input type="date" required value={cohortForm.end_date} onChange={(e) => setCohortForm({ ...cohortForm, end_date: e.target.value })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                  </div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem" }}>Maximum Student Capacity *</label>
                  <input type="number" required value={cohortForm.capacity} onChange={(e) => setCohortForm({ ...cohortForm, capacity: parseInt(e.target.value) })} style={{ width: "100%", padding: "0.6rem", border: "1px solid var(--border-color)", borderRadius: "6px" }} />
                </div>
                <button type="submit" className="btn btn-accent" style={{ marginTop: "1rem" }}>
                  <span>Deploy Cohort</span>
                </button>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
