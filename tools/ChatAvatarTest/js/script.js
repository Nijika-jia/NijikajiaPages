document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const avatarUpload = document.getElementById('avatar-upload');
    const cropperImg = document.getElementById('cropper-img');
    const cropperContainer = document.querySelector('.cropper-container');
    const avatarPreview = document.getElementById('avatar-preview');
    const chatAvatarMe = document.getElementById('chat-avatar-me');
    const chatAvatarOther = document.getElementById('chat-avatar-other');
    const chatAvatarOther2 = document.getElementById('chat-avatar-other2');
    const applyBtn = document.getElementById('apply-btn');
    const cropBtn = document.getElementById('crop-btn');
    const cancelBtn = document.getElementById('cancel-btn');
    const rotateLeftBtn = document.getElementById('rotate-left');
    const rotateRightBtn = document.getElementById('rotate-right');
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    
    let cropper = null;
    let croppedImageUrl = null;
    
    // 监听文件上传事件
    avatarUpload.addEventListener('change', function(e) {
        if (e.target.files.length) {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = function(event) {
                // 显示裁剪容器
                cropperContainer.style.display = 'block';
                
                // 设置图片源
                cropperImg.src = event.target.result;
                
                // 销毁之前的裁剪实例（如果存在）
                if (cropper) {
                    cropper.destroy();
                }
                
                // 初始化裁剪工具
                cropper = new Cropper(cropperImg, {
                    aspectRatio: 1, // 1:1 比例
                    viewMode: 1,     // 限制裁剪框不超出图片的范围
                    guides: true,    // 显示裁剪参考线
                    center: true,    // 显示中心指示器
                    highlight: false, // 不显示白色蒙版
                    background: false, // 不显示网格背景
                    autoCropArea: 0.8, // 初始裁剪区域大小
                    responsive: true,
                    cropBoxResizable: true,
                    cropBoxMovable: true,
                });
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // 向左旋转
    rotateLeftBtn.addEventListener('click', function() {
        if (cropper) {
            cropper.rotate(-90);
        }
    });
    
    // 向右旋转
    rotateRightBtn.addEventListener('click', function() {
        if (cropper) {
            cropper.rotate(90);
        }
    });
    
    // 放大
    zoomInBtn.addEventListener('click', function() {
        if (cropper) {
            cropper.zoom(0.1);
        }
    });
    
    // 缩小
    zoomOutBtn.addEventListener('click', function() {
        if (cropper) {
            cropper.zoom(-0.1);
        }
    });
    
    // 确认裁剪
    cropBtn.addEventListener('click', function() {
        if (cropper) {
            // 获取裁剪后的图片
            const canvas = cropper.getCroppedCanvas({
                width: 200,  // 输出图片宽度
                height: 200, // 输出图片高度
                minWidth: 100,
                minHeight: 100,
                maxWidth: 4096,
                maxHeight: 4096,
                fillColor: '#fff',
                imageSmoothingEnabled: true,
                imageSmoothingQuality: 'high',
            });
            
            // 将裁剪后的图片转换为URL
            croppedImageUrl = canvas.toDataURL('image/jpeg');
            
            // 显示裁剪后的图片预览
            avatarPreview.src = croppedImageUrl;
            
            // 隐藏裁剪容器
            cropperContainer.style.display = 'none';
            
            // 启用应用按钮
            applyBtn.disabled = false;
        }
    });
    
    // 取消裁剪
    cancelBtn.addEventListener('click', function() {
        // 隐藏裁剪容器
        cropperContainer.style.display = 'none';
        
        // 重置文件输入
        avatarUpload.value = '';
        
        // 销毁裁剪实例
        if (cropper) {
            cropper.destroy();
            cropper = null;
        }
    });
    
    // 应用到聊天
    applyBtn.addEventListener('click', function() {
        if (croppedImageUrl) {
            // 更新聊天中的头像
            chatAvatarMe.src = croppedImageUrl;
            
            // 禁用应用按钮，避免重复点击
            applyBtn.disabled = true;
        }
    });
});