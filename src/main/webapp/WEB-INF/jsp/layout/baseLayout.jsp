<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib uri="http://tiles.apache.org/tags-tiles" prefix="tiles" %>
<!DOCTYPE html>
<html>

<head>
    <style>
        .se-pre-con {
            position: fixed;
            left: 0px;
            top: 0px;
            width: 100%;
            height: 100%;
            z-index: 9999;
            background: url(/assets/img/loading-icon3.gif) center no-repeat #fff;
            background-size: 60px 60px;
            background-color: #13121296;
            opacity: 0.90;
        }
    </style>

    <tiles:insertAttribute name="head"/>
</head>

<body>
<div class="se-pre-con"></div>
<div class="overlay">
    <div id="loading-img"></div>
</div>
<div class="main-wrapper">
    <tiles:insertAttribute name="header"/>
    <tiles:insertAttribute name="sideMenu"/>
    <div class="page-wrapper">
        <%--<%@ include file="/WEB-INF/jsp/views/message.jsp" %>--%>
        <tiles:insertAttribute name="body"/>
        <div style="clear: both;"></div>
    </div>
</div>
<div class="sidebar-overlay" data-reff=""></div>
</body>
</html>