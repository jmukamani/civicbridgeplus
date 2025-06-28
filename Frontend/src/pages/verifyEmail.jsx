import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("Verifying...");
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("Invalid verification link.");
      return;
    }
    axios
      .get(`http://localhost:3000/api/auth/verify-token?token=${token}`)
      .then(() => {
        setStatus("Email verified! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      })
      .catch(() => setStatus("Verification failed or link expired."));
  }, [searchParams, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded shadow text-center">
        <h2 className="text-2xl font-bold mb-4">Email Verification</h2>
        <p>{status}</p>
      </div>
    </div>
  );
};

export default VerifyEmail;