<?php
$profile_name = "Saeed Daraghmeh";
$profile_bio = "مرحباً بك في صفحتي الشخصية! هنا تجد جميع روابط حساباتي.";
$profile_image = "saeed.jpg"; // يمكنك استبدالها برابط صورتك

$links = [
    [
        "name" => "فيسبوك",
        "url" => "https://www.facebook.com/share/1FHx2pLsAH/",
        "icon" => "fab fa-facebook-f",
        "color" => "#1877F2"
    ],
    [
        "name" => "تويتر (X)",
        "url" => "https://x.com/Saeed1517187",
        "icon" => "fab fa-x-twitter",
        "color" => "#000000"
    ],
    [
        "name" => "إنستغرام",
        "url" => "https://www.instagram.com/saeed_daraghmeh_3?igsh=dWNhaGVkMzI3bTh3",
        "icon" => "fab fa-instagram",
        "color" => "#E4405F"
    ],
    [
        "name" => "لينكد إن",
        "url" => "https://www.linkedin.com/in/saeed-daraghmeh-b78207358?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
        "icon" => "fab fa-linkedin-in",
        "color" => "#0A66C2"
    ],
    [
        "name" => "يوتيوب",
        "url" => "https://youtube.com/@saeeddaraghmeh-t2r?si=hSaa7UMmbckNbc7D",
        "icon" => "fab fa-youtube",
        "color" => "#FF0000"
    ],
    [
        "name" => "تيك توك",
        "url" => "tiktok.com/@saeed_daraghmeh_3",
        "icon" => "fab fa-tiktok",
        "color" => "#000000"
    ]
];
?>

<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php echo $profile_name; ?> - روابط التواصل الاجتماعي</title>
    <link rel="stylesheet" href="style.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;700&display=swap" rel="stylesheet">
</head>
<body>
    <div class="container">
        <div class="theme-toggle">
            <button id="theme-btn" title="تبديل الوضع">
                <i class="fas fa-moon"></i>
            </button>
        </div>

        <header>
            <div class="profile-img">
                <img src="<?php echo $profile_image; ?>" alt="Profile Picture">
            </div>
            <h1><?php echo $profile_name; ?></h1>
            <p class="bio"><?php echo $profile_bio; ?></p>
        </header>

        <main class="links-container">
            <?php foreach ($links as $link): ?>
                <a href="<?php echo $link['url']; ?>" target="_blank" class="link-card" style="--hover-color: <?php echo $link['color']; ?>">
                    <div class="icon">
                        <i class="<?php echo $link['icon']; ?>"></i>
                    </div>
                    <span class="link-name"><?php echo $link['name']; ?></span>
                    <i class="fas fa-chevron-left arrow"></i>
                </a>
            <?php endforeach; ?>
        </main>

        <footer>
            <p>تم التصميم بواسطة <a href="#">Manus</a> &copy; 2026</p>
        </footer>
    </div>

    <script src="script.js"></script>
</body>
</html>
