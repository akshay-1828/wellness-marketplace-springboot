import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/Button";
import {
  getAnswersForQuestion,
  getQuestions,
  postAnswer,
  postQuestion,
} from "../services/communityService";
import { getCurrentUserId } from "../services/userService";

const CommunityQAPage = () => {
  const role = useMemo(() => localStorage.getItem("role"), []);
  const isLoggedIn = Boolean(localStorage.getItem("accessToken"));

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newQuestion, setNewQuestion] = useState("");
  const [postingQuestion, setPostingQuestion] = useState(false);

  const [answersByQuestionId, setAnswersByQuestionId] = useState({});
  const [loadingAnswers, setLoadingAnswers] = useState({});

  const [answerDrafts, setAnswerDrafts] = useState({});
  const [postingAnswer, setPostingAnswer] = useState({});

  const refreshQuestions = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await getQuestions();
      setQuestions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Load questions error:", err);
      const msg = err?.response?.data?.message || err?.response?.data || err?.message;
      setError(msg || "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshQuestions();
  }, []);

  const onPostQuestion = async (e) => {
    e.preventDefault();
    setError("");

    if (!newQuestion.trim()) return;

    setPostingQuestion(true);
    try {
      const userId = await getCurrentUserId();
      await postQuestion({ userId, question: newQuestion.trim() });
      setNewQuestion("");
      await refreshQuestions();
    } catch (err) {
      console.error("Post question error:", err);
      const msg = err?.response?.data?.message || err?.response?.data || err?.message;
      setError(msg || "Unable to post question.");
    } finally {
      setPostingQuestion(false);
    }
  };

  const loadAnswers = async (questionId) => {
    setLoadingAnswers((prev) => ({ ...prev, [questionId]: true }));
    try {
      const data = await getAnswersForQuestion(questionId);
      setAnswersByQuestionId((prev) => ({
        ...prev,
        [questionId]: Array.isArray(data) ? data : [],
      }));
    } catch (err) {
      console.error("Load answers error:", err);
      setAnswersByQuestionId((prev) => ({ ...prev, [questionId]: [] }));
    } finally {
      setLoadingAnswers((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  const onPostAnswer = async (questionId) => {
    setError("");
    const draft = (answerDrafts[questionId] || "").trim();
    if (!draft) return;

    setPostingAnswer((prev) => ({ ...prev, [questionId]: true }));
    try {
      const practitionerId = await getCurrentUserId();
      await postAnswer({ questionId, practitionerId, answer: draft });
      setAnswerDrafts((prev) => ({ ...prev, [questionId]: "" }));
      await loadAnswers(questionId);
    } catch (err) {
      console.error("Post answer error:", err);
      const msg = err?.response?.data?.message || err?.response?.data || err?.message;
      setError(msg || "Unable to post answer.");
    } finally {
      setPostingAnswer((prev) => ({ ...prev, [questionId]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50/50">
      {/* Mesh Gradient / Glow Header */}
      <div className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-transparent to-indigo-50/20 blur-2xl" />
        <div className="relative mx-auto max-w-4xl px-4 py-8 sm:py-12">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-900 bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text">
                Community Q&A
              </h1>
              <p className="mt-2 text-base text-gray-600">
                Seek guidance, discuss wellness, and share knowledge with practitioners.
              </p>
            </div>
            <Link
              to="/products"
              className="group flex items-center gap-1.5 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-all hover:bg-emerald-100"
            >
              Browse Products
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        {!isLoggedIn && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/50 p-4 backdrop-blur-sm">
            <div className="rounded-full bg-amber-100 p-2 text-amber-700">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </div>
            <p className="text-sm font-medium text-amber-800">
              Sign in to ask questions. Verified practitioners are ready to support you.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50/50 p-4 backdrop-blur-sm">
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* Post Box */}
        <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold shadow-md shadow-emerald-500/10">
              Q
            </div>
            <h2 className="text-lg font-bold text-gray-900">Have a question?</h2>
          </div>
          
          <form onSubmit={onPostQuestion} className="mt-4">
            <textarea
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 resize-none"
              placeholder="E.g., What are good morning yoga stretches for back pain?"
              disabled={!isLoggedIn || postingQuestion}
            />
            <div className="mt-3 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                className="w-auto px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all hover:scale-[1.02]"
                disabled={!isLoggedIn || postingQuestion || !newQuestion.trim()}
                loading={postingQuestion}
              >
                Post Now
              </Button>
            </div>
          </form>
        </div>

        {/* Questions Section */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-gray-900">Recent Activity</h2>
              <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">
                {questions.length}
              </span>
            </div>
            <button
              type="button"
              onClick={refreshQuestions}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 shadow-sm transition-all hover:bg-gray-50 active:scale-95 disabled:opacity-50"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m13 13v-5h-.581m0 0a8.003 8.003 0 01-15.356-2m15.356 2H15" /></svg>
              Refresh
            </button>
          </div>

          {loading && (
            <div className="mt-8 flex flex-col items-center justify-center py-12 text-gray-400">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
              <p className="mt-3 text-sm font-medium">Loading conversation feed…</p>
            </div>
          )}

          {!loading && questions.length === 0 && (
            <div className="mt-8 rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.966L3 20l1.326-3.945A8.963 8.963 0 013 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
              <p className="mt-4 font-medium text-gray-700">No questions posted yet.</p>
              <p className="mt-1 text-sm text-gray-500">Be the first to ask the community!</p>
            </div>
          )}

          <div className="mt-6 space-y-5">
            {questions.map((q) => {
              const qId = q.id;
              const answers = answersByQuestionId[qId];
              const isAnswersLoaded = Array.isArray(answers);
              const isLoadingThisAnswers = Boolean(loadingAnswers[qId]);
              const draft = answerDrafts[qId] || "";
              const isPostingThisAnswer = Boolean(postingAnswer[qId]);

              const avatarColors = [
                'bg-indigo-50 text-indigo-600',
                'bg-amber-50 text-amber-600',
                'bg-violet-50 text-violet-600',
                'bg-rose-50 text-rose-600',
                'bg-cyan-50 text-cyan-600'
              ];
              const colorIdx = (q.userId || 0) % avatarColors.length;

              return (
                <div key={qId} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm shadow-gray-200/40 transition-all hover:shadow-md hover:border-gray-200/80">
                  <div className="flex items-start gap-4">
                    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-black ${avatarColors[colorIdx]}`}>
                      {String.fromCharCode(65 + ((q.userId || 0) % 26))}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-gray-800">User #{q.userId}</p>
                        <span className="h-1 w-1 rounded-full bg-gray-300" />
                        <p className="text-xs text-gray-400">Question</p>
                      </div>
                      <p className="mt-1 text-base font-medium text-gray-900 leading-relaxed">
                        {q.question}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4">
                    <button
                      type="button"
                      onClick={() => loadAnswers(qId)}
                      disabled={isLoadingThisAnswers}
                      className={`flex items-center gap-1.5 text-sm font-bold transition-all ${
                        isAnswersLoaded ? 'text-emerald-700' : 'text-emerald-600 hover:text-emerald-700'
                      }`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H9a2 2 0 00-2 2v10" /></svg>
                      {isAnswersLoaded ? "Hide Answers" : "View Answers"}
                      {isAnswersLoaded && answers.length > 0 && ` (${answers.length})`}
                    </button>
                  </div>

                  {isLoadingThisAnswers && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-gray-500">
                      <div className="animate-spin h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full" />
                      Loading responses…
                    </div>
                  )}

                  {isAnswersLoaded && !isLoadingThisAnswers && (
                    <div className="mt-4 space-y-3 pl-4 border-l-2 border-gray-100">
                      {answers.length === 0 ? (
                        <p className="text-sm text-gray-500 italic">No responses yet from our practitioners.</p>
                      ) : (
                        answers.map((a) => (
                          <div key={a.id} className="group relative rounded-2xl bg-neutral-50/70 p-4 transition-all hover:bg-neutral-50 border border-transparent hover:border-gray-100">
                            <div className="flex items-center gap-2">
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                                P
                              </div>
                              <p className="text-xs font-bold text-gray-800">Practitioner #{a.practitionerId}</p>
                              <span className="flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-700 border border-emerald-100">
                                <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944a11.954 11.954 0 007.834 3.055 1 1 0 01.832 1.057 11.939 11.939 0 01-1.583 6.045c-1.353 2.2-3.4 4.029-5.742 5.284a1 1 0 01-.984 0c-2.342-1.255-4.389-3.084-5.742-5.284a11.939 11.939 0 01-1.583-6.045 1 1 0 01.832-1.057zM10 5a1 1 0 00-.707.293l-3 3a1 1 0 001.414 1.414L9 8.414V13a1 1 0 102 0V8.414l1.293 1.293a1 1 0 001.414-1.414l-3-3A1 1 0 0010 5z" clipRule="evenodd" /></svg>
                                Pro
                              </span>
                            </div>
                            <p className="mt-1.5 text-sm text-gray-700 leading-normal">{a.answer}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {isLoggedIn && role === "PRACTITIONER" && (
                    <div className="mt-5 border-t border-gray-50 pt-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <p className="text-xs font-bold text-gray-700">Answer as Verified Practitioner</p>
                      </div>
                      <textarea
                        value={draft}
                        onChange={(e) =>
                          setAnswerDrafts((prev) => ({ ...prev, [qId]: e.target.value }))
                        }
                        rows={2}
                        className="w-full rounded-2xl border border-gray-200 bg-gray-50/30 px-4 py-3 text-sm outline-none transition-all focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 resize-none"
                        placeholder="Share your guidance…"
                        disabled={isPostingThisAnswer}
                      />
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={() => onPostAnswer(qId)}
                          disabled={isPostingThisAnswer || !draft.trim()}
                          className="w-auto px-5 py-2 rounded-xl bg-emerald-600 font-bold text-white shadow-md shadow-emerald-600/10 hover:bg-emerald-700 transition-all disabled:opacity-50 text-sm"
                        >
                          Send Response
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunityQAPage;
