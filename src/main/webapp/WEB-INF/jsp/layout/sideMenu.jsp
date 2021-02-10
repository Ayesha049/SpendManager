<%@taglib uri="http://www.springframework.org/tags" prefix="spring" %>
<%@taglib uri="http://www.springframework.org/tags/form" prefix="form" %>
<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>

<div class="sidebar" id="sidebar"> <!-- sidebar -->
    <div class="sidebar-inner slimscroll">
        <div id="sidebar-menu" class="sidebar-menu">
            <ul>

            </ul>
        </div>
    </div>
</div>
<script>
    $(document).ready(function () {
        setNavigation();
    });

    function setNavigation() {
        var path = window.location.pathname;
        path = path.replace(/\/$/, "");
        path = decodeURIComponent(path);

        $(".nav-sidebar a").each(function () {
            var href = $(this).attr('href');
            if (path.indexOf(href) > -1) {
                $(this).addClass('active');
                if ($(this).parent().parent().hasClass('nav-sidebar')) {
                    $(this).closest('li').addClass('active');
                } else {
                    $(this).parent().parent().css('display', 'block');
                    $(this).parent().parent().prev().addClass('active');
                    $(this).parent().parent().prev().addClass('subdrop');
                }
                return false;
            }
        });
    }
</script>