<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=0">
<%--<link rel="shortcut icon" type="image/x-icon" href="assets/img/favicon.png">--%>
<%--<title>forecast</title>--%>
<link href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700,900" rel="stylesheet">

<%--CSS DEFINITION--%>
<link rel="stylesheet" type="text/css" href="<c:url value="/assets/css/bootstrap.min.css"/>">
<link rel="stylesheet" type="text/css" href="<c:url value="/assets/css/bootstrap-select.min.css"/>">
<%--<link rel="stylesheet" type="text/css" href="<c:url value="/assets/css/openSansFont.css"/>">--%>
<link rel="stylesheet" type="text/css" href="<c:url value="/assets/css/font-awesome.min.css"/>">
<link rel="stylesheet" type="text/css" href="<c:url value="/assets/css/select2.min.css"/>">
<link rel="stylesheet" type="text/css" href="<c:url value="/assets/css/bootstrap-datetimepicker.min.css"/>">
<link rel="stylesheet" type="text/css" href="<c:url value="/assets/css/bootstrap2-toggle.min.css"/>">
<link rel="stylesheet" type="text/css" href="<c:url value="/assets/css/style.css"/>">
<link rel="stylesheet" type="text/css" href="<c:url value="/assets/css/custom.css"/>">

<script src="<c:url value="/assets/js/jquery-3.3.1.min.js"/>"></script>
<script src="<c:url value="/assets/js/jquery-ui.min.js"/>"></script>
<script src="<c:url value="/assets/js/jquery.validate.min.js"/>"></script>
<script src="<c:url value="/assets/js/popper.min.js"/>"></script>
<script src="<c:url value="/assets/js/bootstrap.min.js"/>"></script>
<script src="<c:url value="/assets/js/bootstrap-select.min.js"/>"></script>
<script src="<c:url value="/assets/js/select2.min.js"/>"></script>
<script src="<c:url value="/assets/js/moment.min.js"/>"></script>
<script src="<c:url value="/assets/js/bootstrap-datetimepicker.min.js"/>"></script>
<script src="<c:url value="/assets/js/jquery.slimscroll.js"/>"></script>
<script src="<c:url value="/assets/js/forecast.js"/>"></script>
<script src="<c:url value="/assets/js/app.js"/>"></script>

<!--[if lt IE 9]>
<script src="assets/js/html5shiv.min.js"></script>
<!--<script src="assets/js/respond.min.js"></script>-->
<![endif]-->

<script>
    $(document).ready(function() {
        $(document).find("div.se-pre-con").fadeOut("slow");
    });
</script>