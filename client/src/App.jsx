import { Route, Routes } from "react-router-dom";
import Layout from "./components/shared/Layout.jsx";
import ProtectedRoute from "./components/shared/ProtectedRoute.jsx";
import Home from "./pages/Home/Home.jsx";
import SearchResults from "./pages/SearchResults/SearchResults.jsx";
import Browse from "./pages/Browse/Browse.jsx";
import PhoneDetail from "./pages/PhoneDetail/PhoneDetail.jsx";
import Compare from "./pages/Compare/Compare.jsx";
import Recommend from "./pages/Recommend/Recommend.jsx";
import Assistant from "./pages/Assistant/Assistant.jsx";
import Dashboard from "./pages/Dashboard/Dashboard.jsx";
import Login from "./pages/Login/Login.jsx";
import Register from "./pages/Register/Register.jsx";
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword/ResetPassword.jsx";
import About from "./pages/About/About.jsx";
import NotFound from "./pages/NotFound/NotFound.jsx";

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
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/about" element={<About />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
