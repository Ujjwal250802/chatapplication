import React from 'react'
import { Route, Routes, Navigate } from 'react-router'
import HomePage from "./pages/HomePage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import GroupsPage from "./pages/GroupsPage.jsx";
import GroupChatPage from "./pages/GroupChatPage.jsx";
import GroupCallPage from "./pages/GroupCallPage.jsx";
import Layout from "./components/Layout.jsx";
import useAuthUser from "./hooks/useAuthUser.js";
import PageLoader from "./components/PageLoader.jsx";
import { useThemeStore } from "./store/useThemeStore.js";

const App = () => {
  const { authUser, isLoading } = useAuthUser();
  const { theme } = useThemeStore();

  const isAuthenticated = !!authUser;
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading) return <PageLoader />;

  return (
    <div className='h-screen' data-theme={theme}>
    <Routes>
      <Route
          path="/"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <HomePage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            !isAuthenticated ? <SignUpPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
          }
        />
        <Route
          path="/login"
          element={
            !isAuthenticated ? <LoginPage /> : <Navigate to={isOnboarded ? "/" : "/onboarding"} />
          }
        />
        <Route
          path="/groups"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout showSidebar={true}>
                <GroupsPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/group-chat/:id"
          element={
            isAuthenticated && isOnboarded ? (
              <Layout>
                <GroupChatPage />
              </Layout>
            ) : (
              <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
            )
          }
        />
        <Route
          path="/group-call/:id"
          element={
            isAuthenticated && isOnboarded ? <GroupCallPage /> : <Navigate to={!isAuthenticated ? "/login" : "/onboarding"} />
          }
        />

    </Routes>
      
    </div>
  )
}

export default App
