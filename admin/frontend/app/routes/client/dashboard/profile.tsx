import { useState, useEffect } from "react";
import { ProfileService, type FrontendProfile } from "~/services/api";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState<FrontendProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);

  // Load profile from backend
  useEffect(() => {
    const loadProfile = async () => {
      try {
        setIsLoading(true);
        const profileData = await ProfileService.getProfile();
        setProfile(profileData);
        setError("");
      } catch (err) {
        setError("Failed to load profile");
        console.error("Error loading profile:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleSave = async () => {
    if (!profile) return;

    try {
      setIsSaving(true);
      await ProfileService.updateProfile(profile);
      setIsEditing(false);
      setError("");
      // Optionally show success message instead of alert
      alert('Profile changes saved successfully!');
    } catch (err) {
      setError("Failed to save profile changes");
      console.error("Error saving profile:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddSkill = () => {
    if (!profile) return;

    const newSkill = prompt('Enter a new skill:');
    if (newSkill && newSkill.trim()) {
      setProfile(prev => prev ? ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }) : null);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    if (!profile) return;

    setProfile(prev => prev ? ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }) : null);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
        {error}
      </div>
    );
  }

  // No profile data
  if (!profile) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 text-yellow-700 rounded-xl">
        No profile data available.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Profile</h1>
          <p className="text-slate-600 mt-1">Manage your personal information and preferences</p>
        </div>
        <button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          disabled={isSaving}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            isEditing
              ? "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Edit Profile"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Picture & Basic Info */}
        <div className="card p-6">
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 bg-gradient-to-r from-indigo-400 to-violet-400 rounded-full flex items-center justify-center text-white text-2xl font-semibold mb-4">
              JD
            </div>
            <h2 className="text-xl font-semibold text-slate-900">{profile.firstName} {profile.lastName}</h2>
            <p className="text-slate-600 text-sm mb-4">Volunteer Member</p>
            <div className="w-full space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {profile.email}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {profile.phone}
              </div>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="title-gradient mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="row">
                <label className="label">First Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={profile.firstName}
                    onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                    className="input" 
                  />
                ) : (
                  <p className="p-3 bg-slate-50 rounded-xl">{profile.firstName}</p>
                )}
              </div>
              <div className="row">
                <label className="label">Last Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={profile.lastName}
                    onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                    className="input" 
                  />
                ) : (
                  <p className="p-3 bg-slate-50 rounded-xl">{profile.lastName}</p>
                )}
              </div>
              <div className="row md:col-span-2">
                <label className="label">Email</label>
                {isEditing ? (
                  <input 
                    type="email" 
                    value={profile.email}
                    onChange={(e) => setProfile({...profile, email: e.target.value})}
                    className="input" 
                  />
                ) : (
                  <p className="p-3 bg-slate-50 rounded-xl">{profile.email}</p>
                )}
              </div>
              <div className="row">
                <label className="label">Phone</label>
                {isEditing ? (
                  <input 
                    type="tel" 
                    value={profile.phone}
                    onChange={(e) => setProfile({...profile, phone: e.target.value})}
                    className="input" 
                  />
                ) : (
                  <p className="p-3 bg-slate-50 rounded-xl">{profile.phone}</p>
                )}
              </div>
              <div className="row">
                <label className="label">Emergency Contact</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={profile.emergencyContact}
                    onChange={(e) => setProfile({...profile, emergencyContact: e.target.value})}
                    className="input" 
                  />
                ) : (
                  <p className="p-3 bg-slate-50 rounded-xl">{profile.emergencyContact}</p>
                )}
              </div>
              <div className="row md:col-span-2">
                <label className="label">Address</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={profile.address}
                    onChange={(e) => setProfile({...profile, address: e.target.value})}
                    className="input" 
                  />
                ) : (
                  <p className="p-3 bg-slate-50 rounded-xl">{profile.address}</p>
                )}
              </div>
              <div className="row md:col-span-2">
                <label className="label">Bio</label>
                {isEditing ? (
                  <textarea 
                    value={profile.bio}
                    onChange={(e) => setProfile({...profile, bio: e.target.value})}
                    className="input h-20" 
                    rows={3}
                  />
                ) : (
                  <p className="p-3 bg-slate-50 rounded-xl">{profile.bio}</p>
                )}
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="card p-6">
            <h3 className="title-gradient mb-4">Skills & Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium"
                >
                  {skill}
                </span>
              ))}
              {isEditing && (
                <button
                  onClick={handleAddSkill}
                  className="px-3 py-1 border-2 border-dashed border-slate-300 text-slate-600 rounded-full text-sm hover:border-slate-400 transition"
                >
                  + Add Skill
                </button>
              )}
            </div>
          </div>

          {/* Volunteer Stats */}
          <div className="card p-6">
            <h3 className="title-gradient mb-4">Volunteer Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-indigo-600">47</p>
                <p className="text-sm text-slate-600">Total Hours</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-sky-600">12</p>
                <p className="text-sm text-slate-600">Events Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-fuchsia-600">95</p>
                <p className="text-sm text-slate-600">Impact Score</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
