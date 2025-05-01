"use client";

import { cn } from "@/lib/utils";
import { FaCalendar, FaCalendarAlt } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CalendarIcon = ({ className }: { className?: string }) => (
  <FaCalendarAlt className={cn("w-7 h-7", className)} />
);

const PlanIcon = ({ className }: { className?: string }) => (
  <FaCalendar className={cn("w-7 h-7", className)} />
);

const ExclamationIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cn("w-7 h-7", className)}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={cn("w-7 h-7", className)}>
    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
  </svg>
);

type InfoCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  bgColor: string;
  onClick?: () => void;
};

const InfoCard = ({ title, value, icon, bgColor, onClick }: InfoCardProps) => {
  return (
    <div className={cn("flex items-center p-2 shadow-lg min-w-full mb-4", bgColor, onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""
    )}
    onClick={onClick}
    >
      <div className="text-white mr-5">
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-white font-bold">{title}</span>
        <span className="text-white font-bold">{value}</span>
      </div>
    </div>
  );
};

type ProfileFieldProps = {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
};

const ProfileField = ({ label, name, value, onChange, type = "text", placeholder }: ProfileFieldProps) => {
  return (
    <div className="flex flex-col md:flex-row">
      <div className="p-3 bg-[#167F92] text-white w-full md:w-1/4 lg:w-1/4">
        {label}
      </div>
      <div className="p-2 w-full md:w-3/4 lg:w-3/4 bg-white border border-gray-200">
        <input 
          type={type} 
          name={name}
          value={value}
          onChange={onChange}
          className="w-full p-1 focus:outline-none" 
          placeholder={placeholder}
        />
      </div>
    </div>
  );
};

export const ProfileAndPaymentHistory = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "Mr. Nitin",
    contactNo: "9723992244",
    password: "",
    estateName: "cleardeals.co.in",
    address: "208, Aditiya Plaza Complex, Near Rathi Hospital, Jodhpur",
    email: "contact@cleardeal.co.in"
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMessage, setUpdateMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    setUpdateMessage("");
    
    try {
      // Simulate API call with a delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Here you would typically send the data to your API
      // const response = await fetch('/api/profile/update', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData)
      // });
      // const data = await response.json();
      
      // For demo purposes, just show success
      setUpdateMessage("Profile updated successfully!");
      
      // Clear password field after update
      setFormData(prev => ({
        ...prev,
        password: ""
      }));
    } catch (error) {
      setUpdateMessage("Failed to update profile. Please try again.");
      console.error("Update error:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleImpPropertyClick = () => {
    router.push('/important-listings');
  };

  return (
    <div className="mx-auto px-4 py-2.5 bg-gray-50">
      {/* Top Section - Info Cards and Profile */}
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Info Cards - Left Side */}
        <div className="flex flex-col w-full md:w-1/4">
          <h2 className="text-2xl font-bold p-2 m-4"></h2>
          <InfoCard
            title="Installation Date"
            value="29th May, 2019"
            icon={<CalendarIcon />}
            bgColor="bg-cyan-500"
          />
          <InfoCard
            title="Plan End Date"
            value="10th May, 2025"
            icon={<PlanIcon />}
            bgColor="bg-red-500"
          />
          <InfoCard
            title="Remaining Days"
            value="13 Days"
            icon={<ExclamationIcon />}
            bgColor="bg-green-500"
          />
          <InfoCard
            title="Imp Property"
            value="6"
            icon={<StarIcon />}
            bgColor="bg-amber-500"
            onClick={handleImpPropertyClick}
          />
        </div>

        {/* Profile Section - Right Side */}
        <div className="w-full md:w-3/4">
          <h2 className="text-xl text-[#167F92] font-medium mb-4 text-center">Your Profile Detail</h2>
          <div className="border border-gray-200 overflow-hidden bg-white">
            <div className="flex flex-col">
              <ProfileField 
                label="Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
              
              <ProfileField 
                label="Contact No."
                name="contactNo"
                value={formData.contactNo}
                onChange={handleChange}
              />
              
              <ProfileField 
                label="Change Password :"
                name="password"
                value={formData.password}
                onChange={handleChange}
                type="password"
                placeholder="Enter only if you want to change your password else leave it blank"
              />
              
              <ProfileField 
                label="Estate Name"
                name="estateName"
                value={formData.estateName}
                onChange={handleChange}
              />
              
              <ProfileField 
                label="Address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
              
              <ProfileField 
                label="Email ID"
                name="email"
                value={formData.email}
                onChange={handleChange}
                type="email"
              />
            </div>
            <div className="flex flex-col items-center p-4">
              {updateMessage && (
                <div className={`mb-3 py-2 px-4 rounded w-full text-center ${
                  updateMessage.includes("success") ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {updateMessage}
                </div>
              )}
              <button 
                className={`bg-[#167F92] text-white px-6 py-2 rounded hover:bg-teal-700 transition-colors ${
                  isUpdating ? "opacity-70 cursor-not-allowed" : ""
                }`}
                onClick={handleUpdate}
                disabled={isUpdating}
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div>
        <h2 className="text-xl text-[#167F92] font-medium mb-4">Payment History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr className="bg-[#167F92] text-white">
                <th className="py-3 px-4 text-left">Transaction Date</th>
                <th className="py-3 px-4 text-left">Payment Mode</th>
                <th className="py-3 px-4 text-left">Amount (Rs.)</th>
                <th className="py-3 px-4 text-left">Transaction Id/Msg</th>
                <th className="py-3 px-4 text-left">Plan Startdate</th>
                <th className="py-3 px-4 text-left">Plan Enddate</th>
                <th className="py-3 px-4 text-left">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  date: "10-04-2025",
                  mode: "Net Banking (AHMEDABAD DISTRICT CO-OPERATIVE BANK)",
                  amount: "8000",
                  transactionId: "Online",
                  startDate: "10-04-2025",
                  endDate: "10-05-2025"
                },
                {
                  date: "10-03-2025",
                  mode: "Net Banking (AHMEDABAD DISTRICT CO-OPERATIVE BANK)",
                  amount: "8000",
                  transactionId: "Online",
                  startDate: "10-03-2025",
                  endDate: "10-04-2025"
                },
                {
                  date: "10-02-2025",
                  mode: "Net Banking (AHMEDABAD DISTRICT CO-OPERATIVE BANK)",
                  amount: "8000",
                  transactionId: "Online",
                  startDate: "12-02-2025",
                  endDate: "10-03-2025"
                },
                {
                  date: "10-01-2025",
                  mode: "Net Banking (AHMEDABAD DISTRICT CO-OPERATIVE BANK)",
                  amount: "8000",
                  transactionId: "Online",
                  startDate: "09-01-2025",
                  endDate: "09-02-2025"
                },
                {
                  date: "13-12-2024",
                  mode: "Net Banking (AHMEDABAD DISTRICT CO-OPERATIVE BANK)",
                  amount: "8000",
                  transactionId: "Online",
                  startDate: "09-12-2024",
                  endDate: "09-01-2025"
                }
              ].map((payment, idx) => (
                <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="py-2 px-4 text-[#167F92]">{payment.date}</td>
                  <td className="py-2 px-4 text-[#167F92]">{payment.mode}</td>
                  <td className="py-2 px-4 text-[#167F92]">{payment.amount}</td>
                  <td className="py-2 px-4 text-[#167F92]">{payment.transactionId}</td>
                  <td className="py-2 px-4 text-[#167F92]">{payment.startDate}</td>
                  <td className="py-2 px-4 text-[#167F92]">{payment.endDate}</td>
                  <td className="py-2 px-4">
                    <a href="#" className="text-blue-500 hover:underline">View | PDF</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ProfileAndPaymentHistory;