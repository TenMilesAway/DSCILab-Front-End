package com.agileboot.domain.lab.user.db;

import com.baomidou.mybatisplus.extension.service.IService;

/**
 * 实验室用户Service接口
 * 
 * @author agileboot
 */
public interface LabUserService extends IService<LabUserEntity> {

    /**
     * 根据用户名查询用户
     * 
     * @param username 用户名
     * @return 用户信息
     */
    LabUserEntity getByUsername(String username);

    /**
     * 根据学号/工号查询用户
     * 
     * @param studentNumber 学号/工号
     * @return 用户信息
     */
    LabUserEntity getByStudentNumber(String studentNumber);

    /**
     * 根据邮箱查询用户
     * 
     * @param email 邮箱
     * @return 用户信息
     */
    LabUserEntity getByEmail(String email);

    /**
     * 根据手机号查询用户
     * 
     * @param phone 手机号
     * @return 用户信息
     */
    LabUserEntity getByPhone(String phone);

    /**
     * 检查用户名是否重复
     * 
     * @param username 用户名
     * @param excludeId 排除的用户ID
     * @return 是否重复
     */
    boolean isUsernameDuplicated(String username, Long excludeId);

    /**
     * 检查学号/工号是否重复
     * 
     * @param studentNumber 学号/工号
     * @param excludeId 排除的用户ID
     * @return 是否重复
     */
    boolean isStudentNumberDuplicated(String studentNumber, Long excludeId);

    /**
     * 检查邮箱是否重复
     * 
     * @param email 邮箱
     * @param excludeId 排除的用户ID
     * @return 是否重复
     */
    boolean isEmailDuplicated(String email, Long excludeId);

    /**
     * 检查手机号是否重复
     * 
     * @param phone 手机号
     * @param excludeId 排除的用户ID
     * @return 是否重复
     */
    boolean isPhoneDuplicated(String phone, Long excludeId);
}
