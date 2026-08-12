import {
  ArrowUpRight,
  Bell,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  Hammer,
  LayoutDashboard,
  Menu,
  Package,
  Plus,
  Settings,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const projects = [
  {
    name: "Modern 3-Bedroom Residence",
    location: "Uyo, Akwa Ibom",
    progress: 78,
    budget: "₦18.5M",
    status: "On Track",
  },
  {
    name: "Commercial Office Complex",
    location: "Lagos, Nigeria",
    progress: 52,
    budget: "₦42.8M",
    status: "In Progress",
  },
  {
    name: "Estate Infrastructure",
    location: "Abuja, Nigeria",
    progress: 31,
    budget: "₦67.2M",
    status: "Needs Attention",
  },
];

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showProjectForm, setShowProjectForm] = useState(false);

  const [projectForm, setProjectForm] = useState({
    name: "",
    location: "",
    progress: 0,
    budget: "",
    status: "In Progress",
  });

  const [stats, setStats] = useState({
    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    total_budget: "0",
    remaining_budget: "0",
  });

  useEffect(() => {
    fetch("/api/projects/stats")
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch((error) => {
        console.error("Failed to load project stats:", error);
      });
  }, []);

  const handleCreateProject = async (event: React.FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: projectForm.name,
          location: projectForm.location,
          progress: projectForm.progress,
          budget: Number(projectForm.budget),
          status: projectForm.status,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to create project");
      }

      console.log("Project created:", data.project);

      setShowProjectForm(false);

      setProjectForm({
        name: "",
        location: "",
        progress: 0,
        budget: "",
        status: "In Progress",
      });

      const statsResponse = await fetch("/api/projects/stats");
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setStats(statsData.stats);
      }
    } catch (error) {
      console.error("Failed to create project:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Failed to create project"
      );
    }
  };

  return (
    <>
	{showProjectForm && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
        <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Create New Project</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add a new construction project.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowProjectForm(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close project form"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleCreateProject} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Project Name
              </label>

              <input
                type="text"
                required
                value={projectForm.name}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    name: e.target.value,
                  })
                }
                placeholder="e.g. Residential Development"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Location
              </label>

              <input
                type="text"
                required
                value={projectForm.location}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    location: e.target.value,
                  })
                }
                placeholder="e.g. Uyo, Akwa Ibom"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  Budget (₦)
                </label>

                <input
                  type="number"
                  required
                  min="0"
                  value={projectForm.budget}
                  onChange={(e) =>
                    setProjectForm({
                      ...projectForm,
                      budget: e.target.value,
                    })
                  }
                  placeholder="50000000"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Progress (%)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={projectForm.progress}
                  onChange={(e) =>
                    setProjectForm({
                      ...projectForm,
                      progress: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Status
              </label>

              <select
                value={projectForm.status}
                onChange={(e) =>
                  setProjectForm({
                    ...projectForm,
                    status: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-slate-400"
              >
                <option value="In Progress">In Progress</option>
                <option value="On Track">On Track</option>
                <option value="Needs Attention">Needs Attention</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => setShowProjectForm(false)}
                className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
              >
                Create Project
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    <div className="min-h-screen bg-slate-50 text-slate-900">
      {sidebarOpen && (
        <button
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close navigation"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Building2 size={21} />
            </div>

            <div>
              <h1 className="text-lg font-bold">BuildTrack</h1>
              <p className="text-[11px] text-slate-400">
                Construction Management
              </p>
            </div>
          </div>

          <button
            className="text-slate-400 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <nav className="space-y-1 px-3 py-6">
          <NavItem
            icon={<LayoutDashboard size={18} />}
            label="Dashboard"
            active
          />
          <NavItem icon={<Building2 size={18} />} label="Projects" />
          <NavItem icon={<ClipboardList size={18} />} label="Tasks" />
          <NavItem icon={<Package size={18} />} label="Materials" />
          <NavItem icon={<Hammer size={18} />} label="Labour" />
          <NavItem icon={<Wallet size={18} />} label="Expenses" />
          <NavItem icon={<Users size={18} />} label="Contractors" />
        </nav>

        <div className="absolute bottom-0 w-full border-t border-slate-100 p-3">
          <NavItem icon={<Settings size={18} />} label="Settings" />
        </div>
      </aside>

      <main className="lg:pl-64">
        <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-8">
          <button
            className="rounded-lg p-2 text-slate-600 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>

          <div className="hidden md:block">
            <p className="text-sm text-slate-400">
              Wednesday, August 12, 2026
            </p>
          </div>

          <div className="ml-auto flex items-center gap-4">
            <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100">
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-orange-500" />
            </button>

            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                SI
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold">Skiver</p>
                <p className="text-xs text-slate-400">Project Manager</p>
              </div>
            </div>
          </div>
        </header>

        <div className="mx-auto max-w-7xl space-y-8 p-4 md:p-8">
          <section className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="mb-1 text-sm font-medium text-orange-600">
                Overview
              </p>

              <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
                Good morning, Skiver 👋
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Here's what's happening across your construction projects.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowProjectForm(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={18} />
              New Project
            </button>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={<Building2 size={20} />}
              label="Total Projects"
              value={String(stats.total_projects)}
              change="+2 this month"
            />

            <StatCard
              icon={<Hammer size={20} />}
              label="Active Projects"
              value={String(stats.active_projects)}
              change={`${stats.total_projects > 0 ? Math.round((stats.active_projects / stats.total_projects) * 100) : 0}% of portfolio`}
            />

            <StatCard
              icon={<CheckCircle2 size={20} />}
              label="Completed"
              value={String(stats.completed_projects)}
              change="+1 this month"
            />

            <StatCard
              icon={<CircleDollarSign size={20} />}
              label="Total Budget"
              value="₦128.5M"
              change={`₦${(Number(stats.remaining_budget) / 1000000).toFixed(1)}M remaining`}
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
            <div className="rounded-2xl border border-slate-200 bg-white">
              <div className="flex items-center justify-between border-b border-slate-100 p-5 md:p-6">
                <div>
                  <h3 className="font-bold">Active Projects</h3>
                  <p className="mt-1 text-xs text-slate-400">
                    Current construction progress
                  </p>
                </div>

                <button className="flex items-center gap-1 text-sm font-semibold text-orange-600">
                  View all <ChevronRight size={16} />
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {projects.map((project) => (
                  <div key={project.name} className="p-5 md:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h4 className="font-semibold">{project.name}</h4>

                        <p className="mt-1 text-xs text-slate-400">
                          {project.location}
                        </p>
                      </div>

                      <span className="w-fit rounded-full bg-orange-50 px-3 py-1 text-[11px] font-semibold text-orange-700">
                        {project.status}
                      </span>
                    </div>

                    <div className="mt-5">
                      <div className="mb-2 flex justify-between text-xs">
                        <span className="text-slate-500">Progress</span>
                        <span className="font-bold">
                          {project.progress}%
                        </span>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-orange-500"
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex justify-between text-xs text-slate-400">
                      <span>Budget: {project.budget}</span>

                      <button className="flex items-center gap-1 font-semibold text-slate-700">
                        Details <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white">
              <div className="border-b border-slate-100 p-5 md:p-6">
                <h3 className="font-bold">Recent Activity</h3>

                <p className="mt-1 text-xs text-slate-400">
                  Latest project updates
                </p>
              </div>

              <div className="space-y-6 p-5 md:p-6">
                <Activity text="Blockwork completed on Modern Residence" />
                <Activity text="₦850,000 material expense recorded" />
                <Activity text="Roofing task assigned to contractor" />
                <Activity text="Weekly site report submitted" />
              </div>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-3">
            <InfoCard
              icon={<ClipboardList size={20} />}
              title="Upcoming Tasks"
              value="14"
              description="Tasks due this week"
            />

            <InfoCard
              icon={<Package size={20} />}
              title="Material Orders"
              value="7"
              description="Awaiting delivery"
            />

            <InfoCard
              icon={<Wallet size={20} />}
              title="Pending Expenses"
              value="₦2.4M"
              description="Awaiting approval"
            />
          </section>
        </div>
      </main>
    </div>
    </>
  );
}

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({
  icon,
  label,
  value,
  change,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
        {icon}
      </div>

      <p className="mt-5 text-sm text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{change}</p>
    </div>
  );
}

function Activity({ text }: { text: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 h-2.5 w-2.5 rounded-full bg-orange-500" />

      <p className="text-sm leading-5 text-slate-700">{text}</p>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  value,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>

      <div>
        <p className="text-xs text-slate-400">{title}</p>
        <p className="font-bold">{value}</p>
        <p className="text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}

export default App;
