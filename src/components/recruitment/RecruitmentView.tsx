import React, { useState } from 'react';
import {
  Briefcase,
  Plus,
  Users,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Star,
  FileText,
  Mail,
  ChevronRight,
  ArrowRight,
  Send,
  Sparkles,
} from 'lucide-react';
import {
  RecruitmentJob,
  Candidate,
  CandidateStage,
  OnboardingCase,
} from '../../types';
import { translations, formatMMK } from '../../utils/translations';

interface RecruitmentViewProps {
  jobs: RecruitmentJob[];
  candidates: Candidate[];
  onAddJob: (job: RecruitmentJob) => void;
  onUpdateCandidateStage: (candidateId: string, newStage: CandidateStage) => void;
  onUpdateCandidateScores: (
    candidateId: string,
    scores: { technical: number; communication: number; culturalFit: number },
    notes: string
  ) => void;
  onHireCandidate: (candidate: Candidate) => void;
  language: 'en' | 'my';
}

export const RecruitmentView: React.FC<RecruitmentViewProps> = ({
  jobs,
  candidates,
  onAddJob,
  onUpdateCandidateStage,
  onUpdateCandidateScores,
  onHireCandidate,
  language,
}) => {
  const t = translations[language];
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [selectedStage, setSelectedStage] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isNewJobOpen, setIsNewJobOpen] = useState(false);
  const [scorecardCandidate, setScorecardCandidate] = useState<Candidate | null>(null);

  // New Job Form State
  const [newJobTitle, setNewJobTitle] = useState('');
  const [newJobDept, setNewJobDept] = useState('Engineering');
  const [newJobType, setNewJobType] = useState<'Full-time' | 'Hybrid' | 'Remote'>('Full-time');
  const [newJobLocation, setNewJobLocation] = useState('Yangon HQ');
  const [newJobOpenings, setNewJobOpenings] = useState(1);
  const [newJobSalary, setNewJobSalary] = useState('2,500,000 - 3,500,000 MMK');
  const [newJobDesc, setNewJobDesc] = useState('');
  const [newJobReqs, setNewJobReqs] = useState('3+ years relevant experience\nStrong collaborative problem solving');

  // Scorecard state
  const [techScore, setTechScore] = useState(4.5);
  const [commScore, setCommScore] = useState(4.5);
  const [cultureScore, setCultureScore] = useState(4.5);
  const [interviewerNotes, setInterviewerNotes] = useState('');

  const handleOpenScorecard = (candidate: Candidate) => {
    setScorecardCandidate(candidate);
    setTechScore(candidate.scores.technical || 4.5);
    setCommScore(candidate.scores.communication || 4.5);
    setCultureScore(candidate.scores.culturalFit || 4.5);
    setInterviewerNotes(candidate.interviewNotes || '');
  };

  const handleSaveScorecard = () => {
    if (!scorecardCandidate) return;
    onUpdateCandidateScores(
      scorecardCandidate.id,
      { technical: techScore, communication: commScore, culturalFit: cultureScore },
      interviewerNotes
    );
    setScorecardCandidate(null);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJobTitle.trim()) return;

    const newJob: RecruitmentJob = {
      id: `job-${Date.now()}`,
      title: newJobTitle,
      department: newJobDept,
      type: newJobType,
      location: newJobLocation,
      openings: Number(newJobOpenings),
      applicantsCount: 0,
      salaryRangeMMK: newJobSalary,
      status: 'active',
      postedDate: new Date().toISOString().split('T')[0],
      description: newJobDesc || 'Job role description...',
      requirements: newJobReqs.split('\n').filter((r) => r.trim().length > 0),
    };

    onAddJob(newJob);
    setIsNewJobOpen(false);
    setNewJobTitle('');
    setNewJobDesc('');
  };

  // Filter candidates
  const filteredCandidates = candidates.filter((c) => {
    const matchJob = selectedJobId === 'all' || c.jobId === selectedJobId;
    const matchStage = selectedStage === 'all' || c.currentStage === selectedStage;
    const matchSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    return matchJob && matchStage && matchSearch;
  });

  const stagesList: CandidateStage[] = ['applied', 'screening', 'interview', 'offer', 'hired', 'rejected'];

  return (
    <div className="space-y-6">
      {/* Page Title & Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {t.recruitmentTitle}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {t.recruitmentSubtitle}
          </p>
        </div>

        <button
          onClick={() => setIsNewJobOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t.postJob}</span>
        </button>
      </div>

      {/* Active Job Openings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => setSelectedJobId(selectedJobId === job.id ? 'all' : job.id)}
            className={`p-4 rounded-xl border transition-all cursor-pointer ${
              selectedJobId === job.id
                ? 'bg-indigo-50/40 border-indigo-500 ring-2 ring-indigo-500/20'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{job.title}</h3>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                  <span>{job.department}</span>
                  <span aria-hidden="true">·</span>
                  <span>{job.type}</span>
                  <span aria-hidden="true">·</span>
                  <span>{job.location}</span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
                {job.openings} {language === 'my' ? 'နေရာ' : 'slots'}
              </span>
            </div>

            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-700 font-medium">
                {job.salaryRangeMMK}
              </span>
              <span className="text-slate-500">
                {job.applicantsCount} applicants
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Candidates Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-white rounded-xl border border-slate-200">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={language === 'my' ? 'လျှောက်ထားသူ ရှာရန်...' : 'Search candidate name, role...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-slate-400 text-xs shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            Stage:
          </span>
          <button
            onClick={() => setSelectedStage('all')}
            className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors whitespace-nowrap ${
              selectedStage === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All ({candidates.length})
          </button>
          {stagesList.map((stg) => {
            const count = candidates.filter((c) => c.currentStage === stg).length;
            return (
              <button
                key={stg}
                onClick={() => setSelectedStage(stg)}
                className={`px-2.5 py-1 rounded-md font-medium capitalize transition-colors whitespace-nowrap ${
                  selectedStage === stg
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {stg} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCandidates.length === 0 ? (
          <div className="col-span-2 text-center py-12 bg-white rounded-xl border border-slate-200 text-xs text-slate-400">
            {language === 'my' ? 'လျှောက်ထားသူစာရင်း မတွေ့ရှိပါ။' : 'No candidates match the filter.'}
          </div>
        ) : (
          filteredCandidates.map((candidate) => (
            <div
              key={candidate.id}
              className="p-5 bg-white rounded-xl border border-slate-200 hover:border-indigo-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    {candidate.name}
                  </h3>
                  <p className="text-xs text-indigo-600 font-medium">
                    {candidate.jobTitle}
                  </p>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                    <span>{candidate.experienceYears} yrs experience</span>
                    <span aria-hidden="true">·</span>
                    <span>Applied {candidate.appliedDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>CV: {candidate.resumeFileName}</span>
                  </div>
                </div>

                {/* Stage dropdown */}
                <select
                  value={candidate.currentStage}
                  onChange={(e) => onUpdateCandidateStage(candidate.id, e.target.value as CandidateStage)}
                  className="text-xs bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 font-medium cursor-pointer"
                >
                  <option value="applied">{t.stageApplied}</option>
                  <option value="screening">{t.stageScreening}</option>
                  <option value="interview">{t.stageInterview}</option>
                  <option value="offer">{t.stageOffer}</option>
                  <option value="hired">{t.stageHired}</option>
                  <option value="rejected">{t.stageRejected}</option>
                </select>
              </div>

              {/* Assessment Scores Ribbon */}
              <div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50 rounded-lg text-center text-xs">
                <div>
                  <div className="text-[10px] text-slate-400">Technical</div>
                  <div className="font-mono font-bold text-slate-800 tabular-nums">
                    {candidate.scores.technical} / 5.0
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Communication</div>
                  <div className="font-mono font-bold text-slate-800 tabular-nums">
                    {candidate.scores.communication} / 5.0
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400">Culture Fit</div>
                  <div className="font-mono font-bold text-slate-800 tabular-nums">
                    {candidate.scores.culturalFit} / 5.0
                  </div>
                </div>
              </div>

              {candidate.interviewNotes && (
                <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2 rounded-md border border-amber-100">
                  "{candidate.interviewNotes}"
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                <button
                  onClick={() => handleOpenScorecard(candidate)}
                  className="text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
                >
                  <Star className="w-3.5 h-3.5" />
                  <span>{t.candidateScorecard}</span>
                </button>

                {candidate.currentStage !== 'hired' ? (
                  <button
                    onClick={() => onHireCandidate(candidate)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{t.moveToOnboarding}</span>
                  </button>
                ) : (
                  <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {language === 'my' ? 'ခန့်အပ်ပြီး (Onboarding တွင်ရှိ)' : 'Hired & in Onboarding'}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Post New Job */}
      {isNewJobOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">{t.postJob}</h3>
              <button
                onClick={() => setIsNewJobOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Job Position Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Lead DevOps Engineer"
                  value={newJobTitle}
                  onChange={(e) => setNewJobTitle(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Department
                  </label>
                  <select
                    value={newJobDept}
                    onChange={(e) => setNewJobDept(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Engineering">Engineering</option>
                    <option value="Product Design">Product Design</option>
                    <option value="People & Culture">People & Culture</option>
                    <option value="Finance & Accounts">Finance & Accounts</option>
                    <option value="Operations">Operations</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Employment Type
                  </label>
                  <select
                    value={newJobType}
                    onChange={(e) => setNewJobType(e.target.value as 'Full-time' | 'Hybrid' | 'Remote')}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Remote">Remote</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Salary Range (MMK)
                  </label>
                  <input
                    type="text"
                    value={newJobSalary}
                    onChange={(e) => setNewJobSalary(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Open Vacancies
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newJobOpenings}
                    onChange={(e) => setNewJobOpenings(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Key Requirements (One per line)
                </label>
                <textarea
                  rows={3}
                  value={newJobReqs}
                  onChange={(e) => setNewJobReqs(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewJobOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Publish Opening
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Scorecard Evaluation */}
      {scorecardCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {t.candidateScorecard}
                </h3>
                <p className="text-xs text-slate-500">
                  {scorecardCandidate.name} · {scorecardCandidate.jobTitle}
                </p>
              </div>
              <button
                onClick={() => setScorecardCandidate(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{t.technicalScore}</span>
                  <span className="font-mono">{techScore.toFixed(1)} / 5.0</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={techScore}
                  onChange={(e) => setTechScore(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{t.communicationScore}</span>
                  <span className="font-mono">{commScore.toFixed(1)} / 5.0</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={commScore}
                  onChange={(e) => setCommScore(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <div className="flex justify-between font-semibold text-slate-700 mb-1">
                  <span>{t.cultureScore}</span>
                  <span className="font-mono">{cultureScore.toFixed(1)} / 5.0</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={cultureScore}
                  onChange={(e) => setCultureScore(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Interviewer Notes & Assessment Summary
                </label>
                <textarea
                  rows={3}
                  value={interviewerNotes}
                  onChange={(e) => setInterviewerNotes(e.target.value)}
                  placeholder="Strong system design and problem solving capabilities..."
                  className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setScorecardCandidate(null)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveScorecard}
                  className="px-4 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                >
                  Save Scorecard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
