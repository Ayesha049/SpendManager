package com.ayeshaapp.spendManager.controller;

import com.ayeshaapp.spendManager.util.Utils;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;


@Controller
public class DashBoardController {

    @GetMapping("/")
    public String getDashBoard() {
        return Utils.getViewWithPrefix("dashboard");
    }
}
