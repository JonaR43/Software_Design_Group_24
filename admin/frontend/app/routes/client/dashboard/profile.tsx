import { useState } from "react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    address: "123 Main St, City, State 12345",
    bio: "Passionate about community service and helping others. I love volunteering for environmental causes and youth programs.",
    skills: ["Event Planning", "Public Speaking", "Team Leadership", "Photography"],
    emergencyContact: "Jane Doe - (555) 987-6543"
  });

  const handleSave = () => {
    setIsEditing(false);
    alert('Profile changes saved successfully!');
  };

  const handleAddSkill = () => {
    const newSkill = prompt('Enter a new skill:');
    if (newSkill && newSkill.trim()) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Profile</h1>
          <p className="text-slate-600 mt-1">Manage your personal information and preferences</p>
        </div>
        <button
          onClick={isEditing ? handleSave : () => setIsEditing(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            isEditing
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-indigo-600 text-white hover:bg-indigo-700"
          }`}
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
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
