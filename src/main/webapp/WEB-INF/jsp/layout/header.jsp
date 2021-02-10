<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@taglib uri="http://www.springframework.org/tags" prefix="spring" %>

<div class="header"> <!-- Header start -->
    <div class="header-left">
        <a class="logo">
            <img src="/assets/img/logo_forecast.png" width="125" height="25" alt="">
        </a>
    </div>
    <div class="page-title-box float-left">
        <a id="mobile_btn_top" class="menu_drawer_btn float-left" href="#sidebar"><i class="fas fa-align-left"
                                                                                     aria-hidden="true"></i></a>
        <!--<h3 class="text-uppercase"></h3>-->
    </div>
    <a id="mobile_btn" class="mobile_btn float-left" href="#sidebar"><i class="fa fa-bars"
                                                                        aria-hidden="true"></i></a>
    <ul class="nav user-menu float-right">
        <li class="nav-item dropdown has-arrow">
            <a href="#" class="dropdown-toggle nav-link user-link" data-toggle="dropdown">
                <i class="fas fa-user-circle"></i> ${principal}
            </a>
            <div class="dropdown-menu">
                <a class="dropdown-item" href="#">My Profile</a>
                <a class="dropdown-item" href="#">Edit Profile</a>
                <a class="dropdown-item" href="/admin/userResourceAllocationList">User Resource Allocation</a>
                <a class="dropdown-item" href="#">Settings</a>
                <a class="dropdown-item" href="/login?logout">Logout</a>
            </div>
        </li>
    </ul>
    <div class="dropdown mobile-user-menu float-right"> <!-- mobile menu -->
        <a href="#" class="nav-link dropdown-toggle" data-toggle="dropdown" aria-expanded="false"><i
                class="fa fa-ellipsis-v"></i></a>
        <div class="dropdown-menu dropdown-menu-right">
            <a class="dropdown-item" href="profile.html">My Profile</a>
            <a class="dropdown-item" href="edit-profile.html">Edit Profile</a>
            <a class="dropdown-item" href="settings.html">Settings</a>
            <a class="dropdown-item" href="login.html">Logout</a>
        </div>
    </div>
</div>