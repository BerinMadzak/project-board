import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";
import { addProjectMember, removeProjectMember, clearError } from "../store/slices/projectSlice";
import { useForm } from "react-hook-form";

interface Props {
  projectId: string;
}

interface AddMemberForm {
  email: string;
}

function getInitials(username: string): string {
  return username
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(username: string): string {
  const colors = [
    "bg-violet-500",
    "bg-indigo-500",
    "bg-sky-500",
    "bg-teal-500",
    "bg-emerald-500",
    "bg-amber-500",
    "bg-rose-500",
    "bg-pink-500",
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default function MemberPanel({ projectId }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, loading, error } = useSelector(
    (state: RootState) => state.projects,
  );
  const currentUser = useSelector((state: RootState) => state.auth.user);
  const project = projects.find((p) => p.id === projectId);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);

  const isOwner = project?.ownerId === currentUser?.id;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberForm>({ defaultValues: { email: "" } });

  const members = [
    ...(project?.owner
      ? [{ ...project.owner, isOwner: true, memberId: "owner" }]
      : []),
    ...(project?.members?.map((m) => ({
      ...m.user,
      isOwner: false,
      memberId: m.userId,
    })) || []),
  ];

  const onAddMember = async (data: AddMemberForm) => {
    try {
      await dispatch(
        addProjectMember({ projectId, email: data.email }),
      ).unwrap();
      setAddModalOpen(false);
      reset();
    } catch {

    }
  };

  const handleRemove = async (userId: string) => {
    setRemovingUserId(userId);
    try {
      await dispatch(removeProjectMember({ projectId, userId })).unwrap();
    } catch {

    } finally {
      setRemovingUserId(null);
    }
  };

  return (
    <>
      <div className="mb-6 bg-white/5 border border-white/10 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white">
            Team Members
            <span className="ml-2 text-gray-500 font-normal text-xs">
              {members.length}
            </span>
          </h3>
          {isOwner && (
            <button
              onClick={() => {
                dispatch(clearError());
                reset();
                setAddModalOpen(true);
              }}
              className="text-xs bg-indigo-500 hover:bg-indigo-400 text-white font-semibold px-3 py-1.5 rounded-md transition-colors"
            >
              + Add Member
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="group relative flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 transition-colors"
            >
              <div
                className={`w-7 h-7 rounded-full ${getAvatarColor(member.username)} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}
              >
                {getInitials(member.username)}
              </div>

              <div className="flex flex-col leading-tight">
                <span className="text-sm text-white font-medium">
                  {member.username}
                </span>
                {member.isOwner && (
                  <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wide">
                    Owner
                  </span>
                )}
              </div>

              {isOwner && !member.isOwner && (
                <button
                  onClick={() => handleRemove(member.memberId)}
                  disabled={removingUserId === member.memberId}
                  title={`Remove ${member.username}`}
                  className="ml-1 w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100 disabled:opacity-50"
                >
                  {removingUserId === member.memberId ? (
                    <svg
                      className="animate-spin w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-3.5 h-3.5"
                    >
                      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                    </svg>
                  )}
                </button>
              )}
            </div>
          ))}

          {members.length === 0 && (
            <p className="text-sm text-gray-500">No members yet.</p>
          )}
        </div>
      </div>

      {addModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setAddModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        >
          <div className="bg-gray-900 border border-white/10 rounded-xl w-full max-w-sm p-6 shadow-2xl">
            <h2 className="text-lg font-semibold text-white mb-1">
              Add Member
            </h2>
            <p className="text-sm text-gray-400 mb-5">
              Invite a user to this project by their email address.
            </p>

            <form
              onSubmit={handleSubmit(onAddMember)}
              className="space-y-4"
              noValidate
            >
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  Email *
                </label>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: "Enter a valid email address",
                    },
                  })}
                  autoFocus
                  type="email"
                  placeholder="colleague@example.com"
                  className="w-full rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-indigo-500"
                />
                {errors.email && (
                  <p className="text-xs text-red-400 mt-1">
                    {errors.email.message}
                  </p>
                )}
                {error && (
                  <p className="text-xs text-red-400 mt-1">{error}</p>
                )}
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="flex-1 rounded-md bg-white/5 border border-white/10 px-3 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 rounded-md bg-indigo-500 hover:bg-indigo-400 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 transition-colors"
                >
                  {loading ? "Adding…" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}