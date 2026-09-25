import { Routes, Route, BrowserRouter } from "react-router-dom";
import Layout from "./components/shared/Layout";
import Home from "./pages/Home/Home";
import SearchResults from "./pages/SearchResults/SearchResults";
import Browse from "./pages/Browse/Browse";
import PhoneDetail from "./pages/PhoneDetail/PhoneDetail";
import Compare from "./pages/Compare/Compare";
import Recommend from "./pages/Recommend/Recommend";
import Assistant from "./pages/Assistant/Assistant";
import Dashboard from "./pages/Dashboard/Dashboard";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ForgetPassword from "./pages/ForgotPassword/ForgotPassword";
import ResetPassword from "./pages/ResetPassword/ResetPassword";
import About from "./pages/About/About";
import NotFound from "./pages/NotFound/NotFound";
import ProtectedRoute from "./components/shared/ProtectedRoute.jsx";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/browse/:brand" element={<Browse />} />
        <Route path="/phones/:slug" element={<PhoneDetail />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/recommend" element={<Recommend />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forget-password" element={<ForgetPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
