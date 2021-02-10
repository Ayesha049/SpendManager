package com.ayeshaapp.spendManager.util;

public class Utils {
    public static String getViewWithPrefix(String viewName){
        return new StringBuilder(Constants.VIEW_PREFIX).append(viewName).toString();
    }
}
