// Data generator for the 15/30-page interactive Slide-Book / Web-Doc VIP
// Token-optimized and fully syntactically correct representation to prevent errors.

export interface GiftSlide {
  title: string;
  subtitle: string;
  image: string;
  p1: string;
  p2: string;
  highlight?: string;
  badge?: string;
  list?: string[];
}

// Compact helper to generate a slide object with minimal syntax overhead
function s(
  title: string,
  subtitle: string,
  badge: string,
  image: string,
  p1: string,
  p2: string,
  highlight: string,
  list: string[]
): GiftSlide {
  return { title, subtitle, badge, image, p1, p2, highlight, list };
}

// Generates high quality extra slides 16-30 for any guide via structured templates
function getExtraSlides(topic: string, author: string): GiftSlide[] {
  let categoryName = "";
  let baseTitle = "";
  let listPrefix = "";

  if (topic === "affiliate_guide") {
    categoryName = "Affiliate / TTLK";
    baseTitle = "Xây Kênh Affiliate";
    listPrefix = "Hành động liên kết";
  } else if (topic === "skincare_guide") {
    categoryName = "Skincare / Mỹ Phẩm";
    baseTitle = "Chăm Sóc Da Mụn";
    listPrefix = "Quy chuẩn skincare";
  } else if (topic === "nutrition_ebook") {
    categoryName = "Thực Dưỡng / Ăn Sạch";
    baseTitle = "Sức Khỏe Thực Dưỡng";
    listPrefix = "Thực đơn dinh dưỡng";
  } else {
    categoryName = "Thời Trang / Phong Cách";
    baseTitle = "Phối Đồ Đón Đầu";
    listPrefix = "Tư duy phối đồ";
  }

  const extraTitles = [
    ["Chuyển Đổi Vàng", "Thời Điểm Bùng Nổ Doanh Số Đỉnh Cao", "KHỞI CHẠY CHIẾN DỊCH"],
    ["Tối Ưu Hóa Tiếp Cận", "Tăng Tốc Đột Phá Lượt Xem Tiếp Cận Khách", "CHIẾN THUẬT QUY MÔ"],
    ["Tâm Lý Đám Đông", "Nắm Bắt Mong Muốn Thầm Kín Khách Hàng", "TÂM LÝ HỌC"],
    ["Tự Động Hóa Chăm Sóc Ngầm", "Cỗ Máy Gửi Thư Tri Ân Khách Quà Tặng", "HỆ THỐNG AUTOMATION"],
    ["Quản Trị Rủi Ro Kênh Sáng Tạo", "Vượt Qua Bão Quét Bản Quyền Của Thuật Toán", "AN TOÀN PHÁP LÝ"],
    ["Seeding Thuyết Phục Kín Đáo", "Cách Tạo Hiệu Ứng Thảo Luận Sôi Nổi", "TƯƠNG TÁC CỘNG ĐỒNG"],
    ["Săn Deal Độc Quyền Giá Sốc", "Tạo Thu Hút Giữ Chân Khách Ở Ao Kín Nhà", "CHĂM SÓC KHÁCH RUỘT"],
    ["Nghệ Thuật So Sánh Trực Quan", "Sắp Đặt Phân Cảnh Trước Sau Đẹp Mắt", "SÁNG TẠO NỘI DUNG"],
    ["Copywriting Thâu Tóm Tâm Trí", "Mô Tả Chạm Sâu Cơn Đau Thúc Đẩy Mua", "VIẾT CONTENT CHUẨN BH"],
    ["Hợp Tác Đôi Bên KOC/KOL", "Sử Dụng Đòn Bẩy Quy Mô Đa Tệp Fan", "LIÊN KẾT PHÁT TRIỂN"],
    ["Hiệu Suất Quay Dựng Batching", "Tiết Kiệm 80% Thời Gian Hậu Kỳ Mỗi Tuần", "QUẢN TRỊ THỜI GIAN"],
    ["Đọc Báo Cáo Phân Tích Thực", "Dựa Vào Chỉ Số CTR Để Sửa Sai Ngay", "PHÂN TÍCH CHỈ SỐ"],
    ["Phân Phối Đa Kênh Phủ Sóng", "Ứng Dụng Độc Quyền Tách Nhãn Hiệu Xu Hướng", "ĐA NỀN TẢNG"],
    ["Bảo Vệ Uy Tín Chuyên Nghiệp", "Lối Sống Lành Mạnh Của Nhà Sáng Tạo", "PHONG CÁCH SỐNG"],
    ["Tuyên Ngôn Đột Phá Triệu Đô", "Khát Vọng Lớn Làm Chủ Tài Sản Số Bền Vững", "MẪU HÌNH THÀNH CÔNG"]
  ];

  // Specific data for each topic to replace generic content with highly detailed, actionable steps
  const topicDetails: Record<string, Array<{ p1: string; p2: string; highlight: string; list: string[] }>> = {
    "affiliate_guide": [
      {
        p1: `Để chuyển lưu lượng truy cập thành thu nhập thực tế, bước quan trọng đầu tiên cho người mới là thiết lập một Bio Link gọn gàng, tập trung. Hãy đặt sản phẩm bán chạy nhất hoặc quà tặng mồi giá trị cao lên đầu trang, dùng nút bấm to màu nổi bật và chèn lời dụ dẫn rõ ràng.`,
        p2: `Mục đích của việc này là xóa bỏ các rào cản thao tác, dẫn dắt khách hàng đi thẳng đến nơi bán hàng mà không bị phân tâm, từ đó tăng vọt tỷ lệ nhấp liên kết (CTR).`,
        highlight: "Một Bio Link thông thoáng là chiếc thu hút gom tiền hoa hồng âm thầm hiệu quả nhất.",
        list: ["Sử dụng công cụ tạo trang liên kết chuyên nghiệp như LadiPage hay Beacons", "Đặt tiêu đề nút bấm mang tính kích thích như 'Nhận ưu đãi 50% tại đây'", "Kiểm tra định kỳ các liên kết xem có bị hỏng hay sai sản phẩm không"]
      },
      {
        p1: `Tối ưu hóa lượt tiếp cận bằng cách bắt nhịp các dải âm thanh đang thịnh hành của thuật toán. Bạn hãy lồng ghép khéo léo dải âm thanh hot dưới dạng nhạc nền nhỏ (volume 3-5%) dưới giọng đọc lôi cuốn của bạn, kết hợp viết mô tả ngắn gọn có chứa các từ khóa ngách chính xác.`,
        p2: `Mục đích là tận dụng sức đẩy của thuật toán phân phối tự động trên nền tảng TikTok/Reels, đưa nội dung của bạn đến đúng tệp khán giả đang có mối quan tâm sâu sắc nhất.`,
        highlight: "Thuật toán không tự đoán chủ đề, nó chỉ phân phối dựa trên thẻ từ khóa bạn gieo.",
        list: ["Sử dụng công cụ phân tích để lọc ra top 5 âm thanh thịnh hành nhất trong ngày", "Chèn tối đa 3-5 hashtag ngách liên quan mật thiết đến chủ đề video", "Đăng tải video đều đặn vào khung giờ vàng từ 19h đến 21h hàng tối"]
      },
      {
        p1: `Vận dụng tâm lý đám đông để dập tắt nỗi sợ bị lừa dối trong tâm trí khách hàng. Bạn hãy thu thập các ảnh chụp màn hình phản hồi tích cực của những người mua trước, lồng ghép vào phân cảnh video hoặc ghim lên đầu phần bình luận một cách tự nhiên tinh tế.`,
        p2: `Mục đích là tạo ra bằng chứng xã hội (Social Proof) vững như bàn thạch, nâng cao uy tín kênh và rút ngắn thời gian do dự của khách hàng tiềm năng.`,
        highlight: "Khách hàng không mua sản phẩm của bạn, họ mua sự an tâm từ trải nghiệm của người khác.",
        list: ["Lập kho lưu trữ tất cả đánh giá 5 sao của người mua về sản phẩm thương mại", "Ghim phản hồi thực chứng chi tiết nhất lên đầu phần thảo luận của video", "Tạo các video ngắn phỏng vấn nhanh cảm nhận thực tế của người dùng cũ"]
      },
      {
        p1: `Hệ thống tự động chăm sóc ngầm giúp bạn chăm sóc và tiếp cận lại khách hàng mà không tốn một giây lao động chân tay. Hãy cài đặt chatbot tự động trả lời bình luận khi khách gõ từ khóa nhận quà, tự động gửi đường dẫn tài liệu qua tin nhắn riêng tư.`,
        p2: `Mục đích là xây dựng danh sách thông tin khách hàng tiềm năng một cách tự động, giữ chân khách trong hệ sinh thái của bạn để tiếp tục tiếp thị các sản phẩm có hoa hồng cao hơn về sau.`,
        highlight: "Tự động hóa giúp bạn thu thập dữ liệu khách hàng ngay cả khi đang ngủ say.",
        list: ["Đăng ký sử dụng nền tảng chatbot tự động như ManyChat cho kênh bán lẻ", "Biên soạn kịch bản nhắn tin tự động chia sẻ giá trị khi khách để lại từ khóa", "Xuất dữ liệu khách hàng đăng ký nhận quà về Google Sheets để lưu trữ"]
      },
      {
        p1: `Phòng chống rủi ro sập kênh bằng việc rà quét và loại bỏ triệt để các từ ngữ bị cấm hoặc vi phạm chính sách của nền tảng. Tránh tuyệt đối việc hứa hẹn chữa khỏi bệnh hoàn toàn hay cam kết làm giàu nhanh chóng ảo diệu trong giọng nói và chữ viết phụ đề.`,
        p2: `Mục đích là giữ cho kênh luôn ở trạng thái an toàn, không bị bóp tương tác hoặc khóa tài khoản vĩnh viễn, bảo vệ thành quả lao động dày công xây dựng.`,
        highlight: "Tôn trọng luật chơi của nền tảng là điều kiện tiên quyết để tồn tại lâu dài.",
        list: ["Cập nhật liên tục danh sách từ ngữ nhạy cảm bị quét của các mạng xã hội", "Sử dụng lối nói giảm nói tránh hoặc ngôn từ mang tính chia sẻ trải nghiệm cá nhân", "Xây dựng thêm 1-2 kênh vệ tinh nhỏ để dự phòng rủi ro quét diện rộng"]
      },
      {
        p1: `Thực hiện seeding bình luận một cách khôn ngoan và kín đáo để kích hoạt tương tác tự nhiên cho video mới đăng. Hãy dùng các tài khoản phụ đóng vai người mua đặt câu hỏi thiết thực về giá, cách sử dụng, sau đó dùng tài khoản chính trả lời rõ ràng kèm lời cảm ơn chân thành.`,
        p2: `Mục đích là dẫn dắt luồng thảo luận trong phần bình luận diễn ra sôi nổi, khiến thuật toán đánh giá đây là video có giá trị cao và tiếp tục đẩy view cho bạn.`,
        highlight: "Bình luận đầu tiên chính là tấm rèm dẫn lối cho cuộc trò chuyện.",
        list: ["Chuẩn bị sẵn 3-5 kịch bản bình luận seeding tự nhiên dưới góc nhìn người mua", "Trả lời toàn bộ bình luận của khán giả trong vòng 1 tiếng đầu sau khi đăng tải", "Sử dụng tính năng ghim bình luận cho những thắc mắc mang tính đại chúng"]
      },
      {
        p1: `Chủ động đàm phán với nhãn hàng để xin các mã giảm giá hoặc đặc quyền độc quyền dành riêng cho tệp fan của kênh bạn. Hãy chuẩn bị một bản giới thiệu ngắn gọn chứng minh lượng tương tác tốt của kênh và gửi lời đề nghị hợp tác chân thành đến brand.`,
        p2: `Mục đích là tạo ra lợi thế cạnh tranh tuyệt đối so với các kênh khác, thúc đẩy tệp fan trung thành ra quyết định mua ngay lập tức tại liên kết của bạn để được hưởng giá hời.`,
        highlight: "Deal độc quyền biến kênh của bạn thành địa chỉ mua sắm ưu tiên số một của fan.",
        list: ["Thiết kế một bản Media Kit giới thiệu chuyên nghiệp về kênh sáng tạo của bạn", "Gửi email đề xuất mã giảm giá mang tên cá nhân của bạn (ví dụ: GIANG20)", "Tổ chức một buổi công chiếu video tặng kèm voucher hời để kích nổ đơn hàng"]
      },
      {
        p1: `Hãy quay các phân cảnh so sánh sản phẩm hoặc hiệu quả trước và sau khi sử dụng một cách trực quan, rõ ràng nhất có thể. Giữ nguyên góc quay, ánh sáng chân thật của camera điện thoại mà không bóp méo hay dùng app chỉnh sửa giả tạo.`,
        p2: `Mục đích là đánh sập hoàn toàn bức tường nghi ngờ cuối cùng trong tư duy của người mua, chứng minh sản phẩm thực sự mang lại giá trị giải quyết nỗi đau của họ.`,
        highlight: "Một giây hình ảnh tương phản chân thật có sức thuyết phục hơn vạn lời hoa mỹ.",
        list: ["Sử dụng chân máy quay cố định góc quay và giữ nguyên điều kiện ánh sáng phòng", "Quay cận cảnh chất liệu hoặc kết cấu sản phẩm khi sử dụng thực tế rộng rãi", "Đặt dải phụ đề so sánh cụ thể những điểm cải tiến rõ rệt nhất sau trải nghiệm"]
      },
      {
        p1: `Viết phần mô tả hay lời thoại dựa trên công thức thu hút tâm trí PAS (Problem - Agitate - Solve). Bắt đầu bằng việc nêu bật nỗi đau nhức nhối của khách hàng, xoáy sâu vào sự bất tiện của nó, sau đó đưa ra sản phẩm tiếp thị liên kết như một giải pháp cứu cánh hoàn hảo.`,
        p2: `Mục đích là khơi gợi cảm xúc đồng cảm mạnh mẽ, kích thích trí tò mò và thôi thúc người dùng hành động ngay lập tức để giải phóng bản thân khỏi nỗi đau đó.`,
        highlight: "Content chất lượng là nói đúng nỗi đau và trao đúng liều thuốc xoa dịu.",
        list: ["Xác định nỗi đau lớn nhất của tệp khách hàng tiềm năng trước khi viết", "Căn chỉnh bố cục caption thông thoáng, dùng các ký tự gạch đầu dòng dễ nhìn", "Đưa ra lời cam kết thực tế kèm liên kết mua sản phẩm ở cuối bài viết"]
      },
      {
        p1: `Tìm kiếm cơ hội hợp tác và thúc đẩy chéo với các KOC/KOL cùng ngách hoặc có tệp khách gần tương thích. Bạn có thể đề xuất cùng quay chung một buổi đánh giá sản phẩm hay chia sẻ tệp quà tăng tài liệu chéo để cùng tăng lượng fan.`,
        p2: `Mục đích là mượn lực đòn bẩy uy tín từ đồng nghiệp để tiếp cận tệp người theo dõi hoàn toàn mới, nhân đôi hiệu quả truyền thông mà không tốn chi phí quảng cáo.`,
        highlight: "Muốn đi nhanh hãy đi một mình, muốn đi xa bền vững hãy đi cùng đồng đội.",
        list: ["Lập danh sách 10 nhà sáng tạo có lượng tương tác tương đương để liên hệ", "Soạn kịch bản hợp tác phân rõ quyền lợi và vai trò của hai bên công bằng", "Tổ chức mini game tặng quà chéo trên kênh của cả hai người đồng loạt"]
      },
      {
        p1: `Phương pháp sản xuất nội dung hàng loạt (Batching) giúp bạn duy trì nhịp độ đăng tải đều đặn mà không rơi vào trạng thái cạn kiệt ý tưởng hay mệt mỏi. Hãy dành trọn vẹn một buổi để lên sẵn dải kịch bản kịch tính, và một buổi khác chỉ chuyên tâm quay phim dứt điểm.`,
        p2: `Mục đích là tối ưu hóa hiệu suất làm việc của trí não và thiết bị quay dựng, tạo ra lượng video dự trữ dồi dào giải phóng bạn khỏi áp lực chạy deadline hằng ngày.`,
        highlight: "Batching là bí mật tự do tối thượng giải phóng sức lao động cho creator.",
        list: ["Lên danh sách 10 chủ đề video và viết sẵn lời thoại chi tiết ra sổ tay", "Thiết lập cố định một góc quay đẹp mắt và sạc đầy pin thiết bị ghi hình", "Sử dụng các phần mềm cắt dựng clip hàng loạt lưu trữ sẵn dưới dạng bản nháp"]
      },
      {
        p1: `Chăm chỉ truy cập vào trang thống kê báo cáo số liệu của sàn liên kết hằng tuần để đánh giá hiệu suất. Hãy quan tâm đặc biệt đến tỷ lệ giữ chân người xem video, tỷ lệ nhấp chuột vào link bio (CTR) và tỷ lệ chuyển đổi đơn hàng thực tế.`,
        p2: `Mục đích là dùng các con số thực chứng khách quan thay cho cảm giác mơ hồ, từ đó phát hiện đúng khâu nào trong thu hút tiếp thị đang bị rò rỉ để kịp thời sửa đổi.`,
        highlight: "Số liệu là tấm gương phản ánh chân thực nhất kỹ năng làm marketing của bạn.",
        list: ["Thống kê lượt view và lượng click link sinh ra hoa hồng mỗi tối chủ nhật", "Cắt bỏ ngay các chủ đề có lượt xem giữ chân người dùng quá thấp dưới 3 giây", "Tập trung 80% nguồn lực sản xuất tiếp các nội dung mang lại doanh số lớn nhất"]
      },
      {
        p1: `Phân phối rộng khắp video của bạn lên đa kênh nền tảng phổ biến như YouTube Shorts, Facebook Reels và Zalo Video bằng cách tải clip sạch không dính logo watermark của app nguồn. Hãy viết dải caption ngắn gọn hướng người xem về link bio nằm ở trang chủ chính.`,
        p2: `Mục đích là tối đa hóa điểm chạm thương hiệu với mọi khách hàng tiềm năng trên mọi mặt trận số, nhặt nhạnh toàn bộ dòng lưu lượng tự nhiên từ thuật toán đa kênh.`,
        highlight: "Sự hiện diện đa nền tảng đều đặn giúp bạn xây dựng pháo đài thương hiệu kiên cố.",
        list: ["Sử dụng công cụ bên thứ ba để tải video gốc không chứa logo nhãn mác", "Tối ưu hóa kích thước video chuẩn dọc tỷ lệ 9:16 phù hợp mọi nền tảng", "Đồng bộ thời gian đăng video trên mọi tài khoản chính ngạch của bạn"]
      },
      {
        p1: `Bảo vệ tuyệt đối uy tín và sự chân thành của bạn trước mọi cám dỗ quảng cáo kiếm tiền nhanh. Hãy cam kết chỉ tiếp thị những sản phẩm bạn đã dốc lòng trải nghiệm thực tế và đánh giá công tâm, trung thực, chỉ rõ ưu điểm kèm nhược điểm rõ ràng sòng phẳng.`,
        p2: `Mục đích là xây dựng lòng tin cậy dài hạn vững chãi trong lòng độc giả, biến họ thành những người mua trung thành liên tục quay lại ủng hộ bạn suốt hành trình sau này.`,
        highlight: "Lòng tin xây dựng mất mười năm nhưng có thể đổ vỡ tan tành chỉ trong một giây.",
        list: ["Tuyệt đối không nhận quảng cáo phóng đại chất lượng sản phẩm vì tiền", "Trả lời thắc mắc khiếu nại của khách hàng liên quan đến sản phẩm tiếp thị nhiệt tình", "Cống hiến 80% nội dung giá trị miễn phí chia sẻ bài học thực tế cho cộng đồng"]
      },
      {
        p1: `Hãy định hình tư duy lớn làm chủ một doanh nghiệp tài sản số thực thụ chứ không chỉ dừng lại ở việc nhặt hoa hồng lẻ hằng ngày. Bạn hãy lên kế hoạch xây dựng cộng đồng khép kín, tự sản xuất cẩm nang mồi độc quyền và nâng chuẩn phong thái chuyên gia trong ngách.`,
        p2: `Mục đích là bứt phá vươn tới mốc tự do tài chính vĩnh viễn, sở hữu một cỗ máy kiếm tiền tự động bền bỉ dạt dào dâng trào tài lộc rạng rỡ bất chấp biến đổi của thời đại.`,
        highlight: "Khát vọng lớn lao kết hợp hành động nhỏ tỉ mỉ hằng ngày kiến tạo nên kỳ tích triệu đô.",
        list: ["Viết mục tiêu tài chính cụ thể và lộ trình hành động dán lên bàn làm việc", "Dành ra ít nhất 30 phút mỗi ngày để nghiên cứu sách chuyên ngành nâng cao kiến thức", "Tham gia các hội khóa huấn luyện VIP đồng hành sửa sai nhanh chóng cùng chuyên gia"]
      }
    ],
    "skincare_guide": [
      {
        p1: `Cá nhân hóa routine chăm sóc da mụn chuyên sâu của bạn dựa trên mức độ nhạy cảm của da. Hãy phân bổ hoạt chất trị mụn như salicyl acid, retinol theo thứ tự lỏng trước, đặc sau, và bôi giãn cách tuần 2-3 lần để da kịp thời làm quen thích ứng dịu mát mướt mát mượt mà.`,
        p2: `Mục đích của việc này là để các hoạt chất quý thẩm thấu tối đa vào dưới biểu bì mà không tự triệt tiêu lẫn nhau, ngăn chặn nguy cơ bỏng rát hay kích ứng mẩn đỏ thảm hại.`,
        highlight: "Làn da mụn là làn da đang bị tổn thương, hãy tiếp cận nó bằng sự nhẹ nhàng tinh tế nhất.",
        list: ["Sắp xếp sữa rửa mặt, toner, serum và kem dưỡng theo đúng độ pH từ thấp đến cao", "Ghi nhật ký phản hồi của da sau mỗi lần bôi thoa hoạt chất mới", "Sử dụng lượng sản phẩm vừa đủ bằng hạt đậu tránh gây quá tải bít tắc lỗ chân lông"]
      },
      {
        p1: `Khống chế ổ viêm nhiễm sừng tấy trực diện bằng cách chấm trực tiếp các sản phẩm đặc trị chứa Benzoyl Peroxide hoặc tinh dầu tràm trà tinh khiết lên đầu mụn. Hãy rửa sạch tay và dùng tăm bông y tế chấm nhẹ nhàng, tuyệt đối không xoa miết lan rộng ra vùng da lành xung quanh.`,
        p2: `Mục đích là đóng băng ổ sưng viêm, cắt đứt sự lây lan của vi khuẩn C.acnes sang nang lông bên cạnh, gom cồi nhanh chóng giúp nhân mụn tự rụng ra khi rửa mặt.`,
        highlight: "Chấm mụn đúng cách giúp xẹp mụn sưng viêm sau 24 giờ mà không để lại vết thâm đen.",
        list: ["Làm sạch da mặt triệt để trước khi chấm các hoạt chất đặc trị mụn viêm", "Chọn nồng độ Benzoyl Peroxide ở mức thấp 2.5% để giảm bong tróc bỏng rát da", "Thực hiện chấm mụn đều đặn ngày 2 lần vào buổi sáng và tối tối"]
      },
      {
        p1: `Phục hồi lớp màng bảo vệ da lipid bằng việc bổ sung các kem dưỡng giàu peptide, vitamin B5 (Panthenol) hoặc Ceramide thiên nhiên. Hãy vỗ nhẹ kem lên da khi bề mặt da vẫn còn ẩm nhẹ để khóa ẩm tối đa giữ ẩm căng bóng.`,
        p2: `Mục đích là vá lại những vết rách rò rỉ ẩm trên da, khói bụi bặm không thể xâm nhập gây sưng tấy mụn diện rộng trở lại.`,
        highlight: "Hàng rào bảo vệ khỏe mạnh là chiếc áo giáp sắt bảo vệ làn da khỏi vi khuẩn gây mụn.",
        list: ["Lựa chọn các loại kem phục hồi có kết cấu lỏng nhẹ, ghi rõ sữa dưỡng ẩm không gây nhân mụn", "Vỗ kem nhẹ nhàng bằng lòng bàn tay ấm ấm ấm giúp thẩm thấu sâu hơn", "Bôi kem phục hồi ngay sau khi sử dụng các serum chứa acid đặc trị mụn"]
      },
      {
        p1: `Sử dụng kem chống nắng quang phổ rộng hằng ngày kể cả khi ở trong nhà hay trời râm mát. Hãy bôi đều một lượng kem bằng hai đột ngón tay lên toàn bộ mặt và cổ, vỗ đều nhẹ tay không miết xoa để tạo màng chắn mịn màng.`,
        p2: `Mục đích là bảo vệ các tế bào da non nớt đang trị liệu khỏi sự tàn phá hủy diệt của tia UV, ngăn chặn quá trình sản sinh hắc tố melanin gây thâm mụn sẫm màu.`,
        highlight: "Mọi công sức trị mụn và dưỡng da sẽ đổ sông đổ biển nếu thiếu bước bảo vệ bằng kem chống nắng.",
        list: ["Chọn kem chống nắng vật lý lai hóa học mỏng nhẹ không nâng tông quá dày bết", "Thực hiện bôi lại kem chống nắng sau mỗi 3-4 tiếng nếu hoạt động ngoài trời", "Tẩy trang kĩ lưỡng cuối ngày bằng nước tẩy trang micellar dịu nhẹ lành tính"]
      },
      {
        p1: `Vệ sinh tuyệt đối các vật dụng tiếp xúc trực tiếp hằng ngày với da mặt của bạn. Hãy lên lịch giặt sạch vỏ gối, chăn ga tối thiểu 1 tuần 1 lần bằng nước giặt không mùi, thường xuyên xịt cồn khử trùng màn hình điện thoại di động và lau khô ráo.`,
        p2: `Mục đích là triệt tiêu nguồn trú ngụ khổng lồ của vi khuẩn và tế bào chết tích tụ lâu ngày, ngăn chặn chúng cọ xát bám ngược trở lại tàn phá nang lông lành.`,
        highlight: "Một chiếc gối bẩn là lò ấp vi khuẩn âm thầm phá hủy mọi công sức bôi thoa của bạn.",
        list: ["Thay vỏ gối định kỳ 2 lần mỗi tuần và phơi dưới ánh nắng mặt trời rực rỡ", "Hạn chế tuyệt đối thói quen áp điện thoại di động trực tiếp vào má khi nghe máy", "Sử dụng khăn lau mặt một lần bằng bông cotton hữu cơ thay thế hoàn toàn khăn tắm"]
      },
      {
        p1: `Học cách tự nặn mụn chuẩn y khoa tại nhà một cách an toàn khi mụn đã hoàn toàn khô cồi, gom nhân chín vàng rõ rệt. Hãy sát trùng toàn bộ dụng cụ nặn mụn bằng cồn 70 độ, dùng tăm bông ấn nhẹ hai bên rìa nốt mụn để đẩy nhân ra ngoài.`,
        p2: `Mục đích là giải phóng nang lông bít tắc chứa đầy mủ và bã nhờn mà không làm rách mô da hay nặn dập gãy mạch máu, tránh tối đa vết thâm rỗ lõm vĩnh viễn.`,
        highlight: "Nặn mụn khi nhân chưa chín là con đường ngắn nhất dẫn đến viêm sâu sẹo rỗ thịt.",
        list: ["Chỉ nặn các nốt mụn đã cồi gom tròn trịa cứng, không đau nhức khi chạm", "Dùng tăm bông sạch ấn nhẹ nương theo chiều lỗ chân lông thở, tránh bóp móng tay", "Chấm ngay dung dịch sát khuẩn povidine hoặc gell kháng viêm sau khi nặn xong"]
      },
      {
        p1: `Xây dựng chế độ ăn uống lành mạnh giảm bớt tuyệt đối đường tinh luyện, sữa động vật và dầu mỡ bão hòa. Hãy thay thế bằng việc uống trà xanh chống oxy hóa, ăn nhiều rau tươi xanh thẫm họ cải và các loại quả mọng nước ngọt mát tự nhiên.`,
        p2: `Mục đích là làm giảm chỉ số đường huyết trong máu, kiểm soát sự tăng tiết hormone IGF-1 kích thích tuyến bã nhờn hoạt động quá mức gây mụn viêm.`,
        highlight: "Làn da rạng rỡ phản ánh trung thực nếp ăn uống thanh sạch từ sâu bên trong cơ thể.",
        list: ["Giảm tối thiểu các thức ăn uống nhiều đường sữa động vật đóng hộp ngọt", "Uống một ly nước ấm ấm pha mật ong chanh loãng vào mỗi buổi sớm mới", "Bổ sung kẽm và các thực phẩm giàu omega-3 lành mạnh như hạt chia, quả óc chó"]
      },
      {
        p1: `Lập kế hoạch thanh lọc xông hơi da mặt bằng các loại thảo mộc tự nhiên như sả, chanh, tía tô mỗi tuần một lần. Hãy đun sôi nước cùng nguyên liệu rồi trùm khăn kín đầu xông hơi ở cự ly an toàn 30cm trong khoảng 8-10 phút dịu nhẹ mát rượi thanh thoát.`,
        p2: `Mục đích là mượn hơi nước ấm làm giãn nở lỗ chân lông nhẹ nhàng, thúc đẩy tuần hoàn máu dưới da, làm lỏng các bã nhờn bám chặt để dễ dàng làm sạch sâu.`,
        highlight: "Xông hơi thảo mộc giải phóng bã nhờn cứng đầu ẩn náu sâu hốc nang lông da dẻ.",
        list: ["Rửa mặt sạch bằng sữa rửa mặt dịu nhẹ trước khi bắt đầu xông hơi nóng", "Sau xông dùng nước mát vỗ nhẹ hoặc chườm đá lạnh se khít lại nang lông", "Bôi thoa kem dưỡng cấp nước mỏng nhẹ ngay lập tức để giữ độ ẩm mịn màng"]
      },
      {
        p1: `Cẩn trọng khi lựa chọn và sử dụng mặt nạ đất sét để hút dầu thừa bã nhờn bám dính. Chỉ bôi mặt nạ lên vùng chữ T đổ nhiều dầu, rửa trôi sạch sẽ bằng nước ấm ngay khi mặt nạ bắt đầu chuyển sang màu xám nhạt và còn hơi ẩm ẩm tay.`,
        p2: `Mục đích là dọn dẹp lượng bã nhờn dư thừa bám dính lỗ chân lông mà không để mặt nạ khô cong hút ngược độ ẩm tự nhiên của biểu bì ra ngoài.`,
        highlight: "Mặt nạ đất sét là chổi quét dầu thừa tuyệt diệu nếu dùng đúng thời gian vàng.",
        list: ["Đắp mặt nạ đất sét tối đa 1-2 lần mỗi tuần từ 5-7 phút không để khô cằn", "Rửa mặt thật sạch bằng nước ấm nhẹ tay kết hợp massage tế bào nhẹ nhàng", "Dùng ngay toner cấp ẩm cân bằng lại da dẻ láng mịn ráo mát thư thái sảng khoái"]
      },
      {
        p1: `Thiết lập nếp sinh hoạt kỷ luật đi ngủ trước 23h hằng tối để da dẻ kích hoạt chu trình tự sửa chữa, chữa lành tự nhiên. Hãy tắt hết màn hình điện thoại xanh trước giờ ngủ 30 phút, hít thở sâu thả lỏng cơ mặt hoàn toàn trên giường tối mát râm ran âm ấm.`,
        p2: `Mục đích là giảm sinh hormone cortisol gây stress, loại hormone trực tiếp kích thích tuyến dầu hoạt động điên cuồng dấy mụn tàn phá mặt biểu bì da dẻ.`,
        highlight: "Giấc ngủ ngon tĩnh tại sâu lắng là liều thuốc tiên hồi sinh sức sống cho làn da.",
        list: ["Tắt các thiết bị điện tử tối thiểu 30-45 phút trước khi đi ngủ tối hằng ngày", "Duy trì phòng ngủ luôn mát mẻ, tối râm và thông thoáng bụi mịn", "Uống một ly nước ấm nhẹ giọng hoặc một tách trà cúc thảo mộc tĩnh tâm"]
      },
      {
        p1: `Lựa chọn các sản phẩm tẩy tế bào chết hóa học như AHA hay BHA thay thế hoàn toàn cho các loại scrub chà xát vật lý thô bạo mông muội. Thấm dung dịch acid dịu nhẹ ra bông cotton lau nhẹ nhàng trên bề mặt da chữ T từ 2 đến 3 lần mỗi tuần tối.`,
        p2: `Mục đích là làm lỏng lẻo liên kết lớp sừng thô ráp, hòa tan bã nhờn tích tụ sâu dưới thu hút nang lông, giúp da dẻ mịn màng thông thoáng tràn đầy sinh khí rực rỡ.`,
        highlight: "Tẩy sừng hóa học nhẹ nhàng dọn đường cho các hoạt chất dưỡng da thấm sâu hơn.",
        list: ["Bắt đầu bằng nồng độ BHA thấp 1-2% hoặc AHA 5% để da dẻ làm quen an toàn", "Bôi thoa trên nền da hoàn toàn khô ráo tránh gây châm chích xót xa bỏng rát", "Luôn bôi bổ sung kem chống nắng kỹ lưỡng vào sáng hôm sau không quên bước"]
      },
      {
        p1: `Xử lý triệt để vết thâm mụn đỏ và thâm mụn đen (PIE và PIH) sau khi mụn đã xẹp hẳn. Hãy bôi thoa các hoạt chất làm sáng da lành tính như Niacinamide, Vitamin C thế hệ mới ổn định hoặc Azelaic Acid mỏng nhẹ lên toàn bộ vùng thâm sạm đen xỉn màu.`,
        p2: `Mục đích là ức chế enzym tyrosinase tạo hắc tố melanin đen đúa sần sùi, đồng thời kháng viêm tăng tốc tuần hoàn làm lành các mạch máu rò rỉ dưới vết thâm đỏ.`,
        highlight: "Trị thâm mụn là hành trình kiên trì, hãy trao thời gian để tế bào đổi mới rực rỡ.",
        list: ["Chọn tinh chất Niacinamide nồng độ 5-10% dịu mát mướt mịn rạng ngời da dẻ", "Bôi thoa đều đặn sáng tối kết hợp che chắn vật lý kỹ lưỡng tránh ăn nắng tối", "Ghi lại ảnh chụp góc sáng cố định hằng tuần để đo lường mức độ mờ thâm"]
      },
      {
        p1: `Rèn luyện ý thức tuyệt đối không dùng tay chạm sờ lên các nốt mụn hay sờ soạng cơ mặt mông muội độc hại. Mỗi khi tay rảnh rỗi vô thức muốn cạy gãi, hãy nắm chặt tay hoặc bôi thoa ngay dưỡng môi, bóp bóng thư giãn giảm bớt stress tâm lý.`,
        p2: `Mục đích là ngăn ngừa hàng triệu ổ vi khuẩn từ móng tay, lòng bàn tay bẩn bám bùng nổ cày xới sâu thêm các vết thương hở trên mặt biểu bì mụn sưng.`,
        highlight: "Bàn tay bẩn là kẻ sát nhân vô hình hủy hoại làn da mụn nhạy cảm gầy guộc tồi.",
        list: ["Dán các miếng dán mụn hydrocolloid bảo vệ nốt mụn hở chống bám tay cào", "Khử trùng rửa tay bằng nước sát khuẩn thường xuyên trong giờ làm việc văn phòng", "Nhờ người thân xung quanh nhắc nhở mỗi khi vô thức đưa tay chạm lên mặt biểu"]
      },
      {
        p1: `Tìm kiếm sự giúp đỡ của các bác sĩ chuyên khoa da liễu uy tín khi mụn bùng phát mất kiểm soát bét nhè sưng tấy đầy mủ viêm đỏ sâu. Hãy xếp lịch thăm khám soi da cụ thể tại bệnh viện y khoa chính ngạch hoặc phòng khám da liễu có giấy phép bảo hiểm.`,
        p2: `Mục đích là chẩn đoán chính xác nguyên nhân ngầm của mụn (hormone nội tiết, vi nấm, dị ứng hoạt chất bôi thoa) để nhận đơn thuốc viên uống bôi thoa chuẩn mực.`,
        highlight: "Trí tuệ y khoa chân thực luôn là ngọn hải đăng soi sáng cho da khỏe láng mịn.",
        list: ["Lập dải danh sách toàn bộ các sản phẩm bôi thoa dạo gần đây để bác sĩ rà quét", "Tuân thủ nghiêm ngặt lộ trình uống bôi thuốc đơn kê đúng giờ giấc rành mạch", "Hỏi bác sĩ rõ ràng về tác dụng phụ tiềm ẩn trước khi uống kháng sinh trị mụn"]
      },
      {
        p1: `Chúc mừng bạn đã đi trọn hành trình lối sống dẻo dai khỏe đẹp trọn đời thương yêu nâng niu bản thân rạng rỡ dạt dào. Hãy cam kết kiên định duy trì routine cơ bản hằng ngày, thăng hoa nếp nghỉ dưỡng tâm hồn, nở nụ cười rạng ngời tự tin rực rỡ dạt dào mượt mà nhất Việt Nam.`,
        p2: `Mục đích là đạt tới phong thái tỏa sáng yên ổn tĩnh lặng của tâm lành da khỏe ráo mát rạng rỡ lâu dài bất chấp sự bào mòn dữ dội của thời gian và năm tháng dạt dào.`,
        highlight: "Làn da khỏe đẹp tỏa sáng là quả ngọt phản hồi của lối sống kỷ luật và tình yêu.",
        list: ["In cẩm nang dán lên gương trang điểm hằng ngày rà soát các bước hành động", "Tham gia cộng đồng yêu chuộng làm đẹp da lành mạnh để chia sẻ kết quả rực rỡ", "Quay vòng quay may mắn rinh ngập tràn quà tặng dưỡng da phục hồi y khoa chuẩn"]
      }
    ],
    "nutrition_ebook": [
      {
        p1: `Xây dựng phương pháp chuẩn bị bữa ăn hàng tuần (Meal Prep) giúp người bận rộn dễ dàng duy trì chế độ Eat Clean lành mạnh mà không tốn công nấu nướng lách cách hằng ngày. Hãy dành ra 2-3 tiếng vào tối chủ nhật để đi chợ, sơ chế rửa sạch thực vật tươi xanh, nấu chín đạm sạch và chia sẵn vào 5 hộp thủy tinh dán nhãn ngày sử dụng rõ ràng rành mạch.`,
        p2: `Mục đích là loại bỏ hoàn toàn sự thèm ăn bộc phát các thức ăn nhanh có hại do mệt mỏi sau giờ làm việc, chủ động kiểm soát tuyệt đối lượng gia vị và chất lượng dầu ăn nạp vào.`,
        highlight: "Chuẩn bị bữa ăn khoa học là bệ đỡ vững chãi cho một lối sống sạch thông thái.",
        list: ["Mua sắm bộ 5 hộp đựng thực phẩm bằng thủy tinh chịu nhiệt lò vi sóng", "Sơ chế rửa sạch ráo sấy khô các rau xanh rải giấy hút ẩm bảo quản ngăn mát", "Cân chia đong đếm đúng định lượng calo đạm xơ béo tốt cho từng hộp tiêu chuẩn"]
      },
      {
        p1: `Thấu tỏ sự thật về tầm quan trọng cốt lõi của nước ép xanh organic thải độc tế bào hằng ngày. Hãy ép lấy nước các loại rau cần tây, dưa chuột, cải kale tươi ngon mướt mát kết hợp nửa quả táo tạo ngọt nhẹ dịu ngọt thanh mát, uống ngay khi bụng đói vào buổi sớm mai vừa mới thức dậy.`,
        p2: `Mục đích là nhanh chóng kiềm hóa cơ thể, bổ sung dạt dào các vitamin enzym tươi sống đi thẳng vào nuôi dòng máu tươi mà không tốn nhiều năng lượng tiêu hóa của dạ dày nát nhừ.`,
        highlight: "Một ly nước ép xanh mỗi sớm là vòi rồng dọn dẹp độc tố cặn bã tích tụ lâu ngày.",
        list: ["Sử dụng máy ép chậm để bảo toàn tối đa các chất dinh dưỡng và vitamin sống", "Tỷ lệ vàng phối nước ép xanh là 80% rau xanh đậm kết hợp 20% củ quả tạo ngọt", "Uống chậm rãi ngậm nhẹ từng ngụm nước ép trong vòm miệng trước khi nuốt xuống"]
      },
      {
        p1: `Tối ưu hóa các chất béo tốt lành mạnh cho cơ thể bằng cách cắt bỏ hoàn toàn các loại mỡ động vật bão hòa hay dầu mỡ chiên đi chiên lại. Hãy sử dụng mộc mạc dầu dừa ép lạnh cho các món rán nhẹ, dầu oliu nguyên chất chan rưới trực tiếp lên các dĩa salad tươi xanh thẫm.`,
        p2: `Mục đích là bảo vệ thành mạch máu khỏi mảng bám xơ vữa nguy hại, bồi bổ tế bào màng não hoạt động thông suốt tinh tường và giúp cơ thể hấp thụ dễ dàng các vitamin tan trong dầu (A, D, E, K).`,
        highlight: "Chất béo tốt là nguyên liệu thắp sáng năng lượng thông thái hoạt động cho tế bào.",
        list: ["Chuyển sang dùng dầu quả bơ hoặc dầu dừa chịu nhiệt độ cao khi áp chảo thực sự", "Thêm 1/4 quả bơ tươi hoặc một nhúm hạt hạnh nhân óc chó vào đĩa ăn tối hằng ngày", "Tuyệt đối tránh xa bơ thực vật nhân tạo và mứt bánh công nghiệp chứa trans-fat"]
      },
      {
        p1: `Hiểu sâu sắc về cơ chế vận hành chuyển hóa mỡ thừa của phương pháp Nhịn Ăn Gián Đoạn (Intermittent Fasting 16/8) chuẩn khoa học. Bạn hãy khép khung giờ ăn uống hằng ngày lại trong vòng đúng 8 tiếng (ví dụ từ 11h trưa đến 19h tối), và dành trọn vẹn 16 tiếng còn lại chỉ uống nước lọc thanh mát, trà xanh nhạt không đường.`,
        p2: `Mục đích là để nồng độ hormone insulin trong cơ thể hạ xuống mức thấp nhất, kích hoạt trạng thái đốt mỡ tự thân tạo ra năng lượng thay thế, giải dọn sạch mỡ nội tạng chai lì lâu ngày gồ ghề.`,
        highlight: "Nhịn ăn gián đoạn hợp lý giúp tế bào dọn dẹp rác nội bào tự sửa chữa tuyệt đỉnh.",
        list: ["Chọn khung giờ nhịn ăn phù hợp nhất với nếp sinh hoạt công việc hằng ngày", "Trong khung nhịn ăn chỉ sử dụng nước lọc thông thường, trà nhạt không đường", "Ăn đủ chất bồi bổ lượng calo cần thiết ở 2 bữa ăn chính của khung ăn uống"]
      },
      {
        p1: `Tìm hiểu và phân loại rành mạch tinh bột tốt hấp thu chậm (Complex Carbs) cốt lõi so với tinh bột xấu hấp thu nhanh gây hại cho insulin tuyến tụy. Hãy hạn chế tối đa ăn cơm trắng tinh chế dẻo, bánh mì bột lọc chà xát trắng phau, thay thế bằng gạo lứt nguyên cám đỏ mộc mạc dồi dào dinh dưỡng, khoai lang nướng, yến mạch thô giòn ngọt dịu.`,
        p2: `Mục đích là duy trì đường huyết luôn ở nấc ổn định phẳng phiu, loại bỏ triệt để các cơn đói giả vờ thèm ăn vặt liên miên hằng giờ, duy trì nguồn lực năng lượng dồi dào sảng khoái.`,
        highlight: "Tinh bột nguyên cám là nguồn năng lượng an lành nhất nuôi lớn cơ bắp và dạng ngời dẻo dai.",
        list: ["Chuyển dần sang cơm gạo lứt muôi nhỏ kết hợp các loại hạt đậu đỗ đun chín dẻo", "Đọc dải nhãn thực phẩm tránh các loại bánh nguyên hạt chứa nhiều phụ gia đường", "Ăn tinh bột tốt kèm nhiều rau xanh chứa dạt dào chất xơ tự nhiên kìm hãm đường"]
      },
      {
        p1: `Xây dựng lối sống tự chế tạo uống nước ion kiềm thảo mộc tại nhà siêu thanh lọc giải độc cơ thể dạt dào. Hãy cắt mỏng vài lát dưa hấu mát ngọt tươi ngon, chanh tươi mọng nước kèm dải lá bạc hà thơm mát dầm dập tẩm vào bình nước thủy tinh 2 lít nước mát ngâm 2 tiếng trong tủ lạnh mát mát ấm rạng.`,
        p2: `Mục đích là kích hoạt nguồn nước uống chứa dạt dào chất điện giải tự nhiên thơm tho thanh khiết, bù khoáng nhanh chóng cho cơ thể tỉnh táo mà không lo nạp đường hóa học độc địa.`,
        highlight: "Nước kiềm thảo mộc hồi sinh độ tươi trẻ dầy dặn cho tế bào từng giây hoạt động bảnh.",
        list: ["Chuẩn bị bình nước thủy tinh lớn có nắp đậy khít chống xộc mùi tủ lạnh chật bẩn", "Ngâm thảo mộc tươi sạch ngập trong nước mát tối đa 4 tiếng trước uống ngọt", "Uống rải đều bình nước ngập tràn sức sống dẻo dai căng mướt suốt buổi học làm"]
      },
      {
        p1: `Tẩy chay loại bỏ vĩnh viễn bột ngọt hóa học, chất điều vị và hạt nêm công nghiệp chứa nhiều bột phụ gia độc hại. Hãy thay đổi thói quen nêm nếm món nấu ấm cúng gia đình bằng muối hồng Himalaya tinh khiết, nước tương cốt đậu nành lên men tự nhiên và bột tỏi, củ sả nghệ mộc mạc.`,
        p2: `Mục đích là làm sạch hệ huyết quản khỏi lượng natri dư thừa giữ nước phù thũng cơ thể, bảo vệ niêm mạc màng ruột yếu ớt và giúp khẩu vị đầu lưỡi tìm lại độ nhạy bén nguyên bản.`,
        highlight: "Gia vị mộc mạc tự nhiên đón chào vị ngon ngọt chân thật nhất của mẹ thiên nhiên.",
        list: ["Dọn dẹp hũ gia vị công nghiệp cũ vứt bỏ bớt chất tạo ngọt hóa chất ăn xổi", "Tập trung nêm hạt muối hồng mộc, bột tỏi sấy khô thơm lành vừa phải ráo mịn", "Sử dụng vị ngọt thanh tự nhiên từ củ hành tây nướng, táo lê nấu nước dùng ngon"]
      },
      {
        p1: `Nghiên cứu ứng dụng các thực phẩm lên men tự nhiên giàu lợi khuẩn Probiotics tuyệt vời cho đường ruột khỏe mạnh. Hãy tự tay làm dưa cải kim chi muối chua mộc, uống sữa hạt kefir hay sữa chua hy lạp tự ủ ráo mịn mát mát dồi dào sinh khí.`,
        p2: `Mục đích là bồi bổ gia cố cho tệp vi sinh vật có lợi của màng ruột hoạt động dũng mãnh, nới rộng tỷ lệ trao đổi hấp thu dưỡng chất vàng và tăng sức đề kháng miễn dịch toàn thân.`,
        highlight: "Đường ruột là bộ não thứ hai quyết định 80% chỉ số an vui khỏe mạnh của bạn.",
        list: ["Thêm một thìa dưa kim chi tự nhiên tự muối chua vào dĩa ăn cơm hằng trưa hằng", "Ăn một hũ nhỏ sữa chua hy lạp không đường tự ủ cùng quả mọng chín mọng mượt", "Hạn chế uống các loại thuốc kháng sinh bừa bãi khi chưa có hướng dẫn khoa học"]
      },
      {
        p1: `Rèn luyện tư duy thực hành ăn chậm nhai kỹ tối thiểu 30-40 lần trước khi nuốt từng ngụm miếng đồ ăn cắn. Hãy đặt bát đũa xuống bàn sau mỗi lượt gắp nhai thả lỏng, tập trung lắng nghe sự chuyển động tinh tế của cơ hàm và dải mùi thơm tỏa dịu của hạt thực vật ngon ngọt mát.`,
        p2: `Mục đích là chia nhỏ bóp vụn thức ăn cơ học ngay tại khoang miệng mộc mạc, hòa trộn enzim amylase tiêu hóa dịu mát giúp dạ dày làm việc thong dong rảnh rang dồi dào.`,
        highlight: "Nhai kỹ gặt hái triệt để dải năng lượng an vui tinh túy ẩn sâu trong thực phẩm tươi.",
        list: ["Đếm thầm nhịp nhai tối thiểu 30 lần cho miếng cơm gạo lứt đầu tiên cảm nhận", "Không sử dụng thiết bị điện tử điện thoại hay xem tivi trong khi đang ăn cơm tối", "Kết thúc bữa ăn khi cảm nhận thấy bụng vừa lửng bụng lửng dạ tầm 80% no no"]
      },
      {
        p1: `Cẩn trọng thấu tỏ nguyên nhân sâu xa của việc bổ sung dạt dào dải protein đạm thực vật chất lượng cao từ các loại dập mầm hạt quý hiếm. Hãy phối trộn cân bằng đạm từ đậu nành hữu cơ, hạt diêm mạch quinoa, đậu lăng đỏ dồi dào nấu chín nhừ thơm ngậy rạng ngời sảng khoái.`,
        p2: `Mục đích là xây dựng bồi đắp và khôi phục các thớ cơ săn chắc dẻo dai căng mướt mà không nạp kèm theo mỡ xấu cholesterol độc hại bão hòa từ đợt thịt đỏ bẩn thỉu.`,
        highlight: "Đạm thực vật tinh sạch nuôi lớn cơ thể dẻo dai săn chắc mướt mát mịn màng.",
        list: ["Ngâm hạt đậu lăng đỏ óc chó qua đêm kích hoạt enzyme tẩy trừ độc tố bám bám", "Thêm một cốc sữa hạt nguyên chất tự nấu ấm ấm ấm dịu giọng vào chiều mát hằng", "Phối trộn quinoa cùng cơm gạo lứt tạo dải protein hoàn chỉnh đầy đủ acid amin"]
      },
      {
        p1: `Xây dựng phương án detox làm sạch lọc cặn lá gan bằng nước ngâm lá trà bồ công anh thảo mộc tự nhiên thơm lành mát dịu. Hãy hãm lá bồ công anh sấy khô trong phích nước nóng ấm 15 phút, uống nhâm nhi thay nước lọc suốt buổi làm việc văn phòng thanh thản bảnh bao thảnh thơi sáng láng.`,
        p2: `Mục đích là kích thích hoạt động tiết mật bôi trơn dải tiêu hóa của tế bào gan mật hằng ngày hằng giờ, tăng hiệu suất giải độc lọc chất dư thừa hóa chất độc đọng trong mô cơ.`,
        highlight: "Lá gan thanh sạch giải phóng năng lượng cho làn da căng mướt dạt dào rực rỡ dẻo.",
        list: ["Mua lá bồ công anh sấy khô chuẩn organic từ cơ sở uy tín chính ngạch Việt", "Hãm nước thảo mộc bằng phích thủy tinh giữ nhiệt ráo mịn không dùng cốc nhựa rác", "Uống nhâm nhi từ tốn mát mát cả ngày không uống dồn dập dồn dập hại thận bàng"]
      },
      {
        p1: `Tìm hiểu và cách xa các cạm bẫy chất ngọt nhân tạo ẩn nấp trong các chai cốc nước ngọt gắn mác ăn kiêng không calo độc địa mưu cầu bồng bột. Hãy thay thế cảm giác thèm ngọt mông muội bằng việc băm nhỏ quả chà là chín muồi tự nhiên, cỏ ngọt stevia khô nhẹ dịu.`,
        p2: `Mục đích là bảo vệ tệp lợi khuẩn đường ruột khỏi bị hủy diệt bởi hóa chất sucralose dối lừa, triệt tiêu tín hiệu mông muội thèm ngọt ảo của vỏ não gầy guộc sùi sùi.`,
        highlight: "Ngọt tự nhiên thong thả nâng niu thớ vị giác tìm về nấc bình dị mộc mạc.",
        list: ["Đọc bảng nhãn tránh xa chất aspartame, acesulfame K trong chai nước ngọt xanh", "Sử dụng quả ngọt chà là tự nhiên tạo ngọt khi xay sữa hạt mịn màng béo dồi", "Gia tăng uống nước lọc trắng ấm mát tinh khiết xua tan cơn thèm đồ ăn vặt bậy"]
      },
      {
        p1: `Bảo tồn dạt dào các dải khoáng chất xanh bằng phương pháp chọn mua những loại rau củ được canh tác thuận tự nhiên, thuần chủng Non-GMO không phun hóa chất trừ sâu độc địa bét nhè cực đoan bẩn sầu. Hãy ngâm rửa bằng nước ion kiềm hoặc giấm muối loãng 10 phút trước nấu chín nhẹ mát.`,
        p2: `Mục đích là khóa chặt lại các chất chống oxy hóa tự nhiên quý báu dạt dào dâng trào sinh khí, dẹp bỏ nguy cơ lưu cữu hóa chất tàn phá tế bào nội tạng của chúng ta.`,
        highlight: "Thuận tự nhiên là chân lý vàng nương theo bảo bọc sức khỏe vĩ đại giống nòi rực.",
        list: ["Chọn rau theo mùa thuận tự nhiên địa phương không mua rau trái mùa tẩm thuốc", "Ngâm rửa thảo quả rau xanh bằng giấm táo hoặc muối hồng loãng khóa bong bóng", "Ăn đa dạng màu sắc rau diệp lục (đỏ, vàng, tím, xanh thẫm) phong phú dạt dào dâng"]
      },
      {
        p1: `Hãy xây dựng một kế hoạch rà quét sức khỏe định kỳ thông minh rạng ngời bằng việc xét nghiệm máu đo lường chỉ số mỡ gan, axit uric hằng năm. Tìm kiếm sự định hướng từ các bác sĩ y khoa dinh dưỡng chuyên môn cao chính ngạch để hoàn tất dải bổ sung vi chất bị thiếu.`,
        p2: `Mục đích là thấu triệt tình trạng thực trạng nội thể khoa học bản thân để tinh chỉnh thực đơn ăn uống mộc mạc thuận tự nhiên cho tương thích 100% với gen di truyền cơ địa.`,
        highlight: "Khoa học y học chân thực là người bảo vệ thầm lặng cho cuộc sống dạt dào an khang.",
        list: ["Lập thời gian biểu xét nghiệm tổng quát hằng năm cố định vào tháng sinh nhật", "Lưu trữ phiếu kết quả xét nghiệm qua các năm ra file so sánh đối chiếu nhanh", "Nhờ bác sĩ phân tích dải chỉ số hồng cầu, canxi ferritin để tự bù đắp món ăn"]
      },
      {
        p1: `Chúc mừng bạn đã đi trọn hành trình lối sống sinh khí dạt dào, cán mốc 30 chương cẩm nang dinh dưỡng thực dưỡng và eatclean thượng hạng do chuyên gia thiết lập rạng ngời dồi dào tài lộc an vui. Hãy vững vàng áp dụng kiên trì, giải phóng sức sống nguyên bản của tế bào dẻo dai tràn đầy năng lượng vàng sầm uất xinh đẹp mát lành mượt mà nhất Việt Nam.`,
        p2: `Mục đích là đạt tới sự cân bằng tuyệt đối của thân khỏe - tâm an - trí sáng sủa ngập tràn tài lộc, hưởng trọn vẹn hạnh phúc bình dị mộc mạc của cuộc sống trường tồn.`,
        highlight: "Sức khỏe vạn năng là tài sản vĩ đại nhất của đời người, hãy yêu thương bản thân.",
        list: ["In cẩm nang PDF treo ngay bàn ăn nhắc nhở tinh thần kỷ luật rạng ngời rạng", "Chia sẻ cẩm nang quý cho gia đình đồng nghiệp để cùng sống xanh an lành an", "Quay thưởng hái voucher săn nông sản hữu cơ tri ân ngập tràn tài lộc sung túc"]
      }
    ],
    "fashion_tips": [
      {
        p1: `Xây dựng sơ đồ tủ đồ viên nang (Capsule Wardrobe) thông minh sành mặc cho giới quý tộc tinh tế tối giản thời thượng. Hãy chọn lọc đúng 15 món đồ vàng dẻo dai cơ bản chất lượng cực cao như áo thun cổ tròn mịn màng beige, quần tây ống đứng đen tuyền, áo khoác blazer dệt len tơ thủ công để phối trộn đa dạng.`,
        p2: `Mục đích là giải phóng tư duy khỏi sự lạm dụng mua sắm bốc đồng vô ích bừa bãi tốn tiền, tối ưu hóa triệt để 100% khả năng biến hóa phối hợp đồ đạt chuẩn style sang trọng thầm lặng.`,
        highlight: "Càng tinh giản tủ quần áo, phong cách thời thượng của bạn càng sừng sững dạt dào sang.",
        list: ["Dọn dẹp loại bỏ triệt để các áo quần lỗi mốt, hỏng khóa rách chỉ quê kiểng sờn", "Đầu tư vào 3 gam màu chủ lực trường tồn: đen, trắng kem nhạt và màu nâu rêu bò", "Thực hành phối thử 30 outfit khác nhau chỉ từ 15 món đồ vàng đã chọn lọc kỹ dào"]
      },
      {
        p1: `Hiểu thấu triệt và ứng dụng tư duy tỷ lệ vàng cơ thể 1/3 và 2/3 trong phối đồ thị giác đỉnh cao nâng dáng. Bạn hãy luôn đóng thùng nhẹ nhàng tà áo vạt trước, sử dụng thắt lưng bản thanh mảnh tinh xảo chia tách eo ảo tít bên trên rốn để kéo dài mướt mát đôi chân hồng.`,
        p2: `Mục đích là làm chủ ảo ảnh thị giác của người đối diện hâm mộ nhìn ngắm, ăn gian chiều cao thực tế vô cùng thanh thoát kiêu sa mà không lo dìm dáng béo lùn thô vụng.`,
        highlight: "Tỷ lệ phối đồ thông minh quyết định diện mạo quý phái hơn là số đo thực của dáng.",
        list: ["Tránh xa các kiểu áo thun dáng quá dài lêu nghêu phủ mông không sơ vin tà tà", "Diện quần cạp cao chất liệu đứng phom cứng phối cùng áo khoác lót croptop", "Rà soát lại tỷ lệ thị giác trước gương lớn 3 chiều trước khi đặt bước đi dạo phố"]
      },
      {
        p1: `Nắm bắt được sức mạnh kỳ diệu bù trừ của phụ kiện tạo điểm nhấn đắt giá cho toàn cây outfit đơn điệu. Hãy chuẩn bị sẵn một bộ khuyên tai mạ vàng ấm áp cho làn da tông màu ấm nóng rực, hoặc trang xuất mạ bạc lấp lánh cho làn da mát lạnh trong trẻo mịn màng, phối kèm túi da mềm mướt mát.`,
        p2: `Mục đích là bọc lót nâng tầm toàn bộ trang phục bình dân lên nấc xa xỉ lịch thiệp, thể hiện nếp sống ngăn nắp chú trọng sự ngăn nắp tỉ mỉ hoàn chỉnh trong gu ăn mặc gọn.`,
        highlight: "Phụ kiện tinh xảo chính là nét chấm phá nâng tầm đẳng cấp của outfit tối giản.",
        list: ["Sở hữu một chiếc đồng hồ dây da mảnh khảnh đen hoặc nâu sành điệu bền bỉ dẻo", "Sử dụng khăn lụa tơ tằm thắt nhẹ tà cổ áo choàng vest quý phái kiêu kỳ sang", "Duy trì lau chùi bóng bảy phụ kiện kim loại tránh bị xỉn màu mốc rêu đen tối bẩn"]
      },
      {
        p1: `Bí quyết chinh phục phong cách thời trang Monochromatic (phối đồ một tông màu đơn sắc độc bản) thu hút vạn ánh nhìn hâm mộ sầm uất. Bạn hãy mặc cả một cây đồ đồng màu sữa beige cát ấm, nhưng khéo léo phối trộn các kết cấu vật liệu đối nghịch sâu sắc như áo nỉ xốp còng thô mix chân váy lụa trơn tuột bóng bẩy chảy rủ.`,
        p2: `Mục đích là tạo ra dải kéo dài vóc dáng mảnh khảnh tuyệt đối đầy quyến rũ, xây dựng phông nền nhã nhặn đậm phong thái trung lưu thượng lưu an nhàn thư thái tự do tự tại.`,
        highlight: "Diện một màu đồng diện nhưng biến tấu dạt dào dải kết cấu khác biệt sâu sắc.",
        list: ["Chọn các tông màu trung tính pastel nhã nhặn dịu nhẹ cho outfit dạo phố ngày", "Sử dụng giày búp bê tệp màu da chân để kéo dài tối đa chiều cao visual sành", "Điểm xuyết khuyên tai to bản lấp lánh làm điểm nhấn tiêu cự duy nhất rực rỡ"]
      },
      {
        p1: `Lựa chọn giày chuẩn điệu nâng đỡ dáng đi thanh thoát, tôn vinh phom dáng của từng mẫu váy đầm thướt tha. Tránh xa các mẫu giày bốt đế xuồng nặng nề quê mùa cồng kềnh thô kệch thê thảm đen thùi lùi khi diện váy mỏng bay rủ, hãy thay thế bằng đôi gót nhọn mảnh.`,
        p2: `Mục đích là duy trì sự cân bằng trọng lượng thị giác của đôi chân, nương theo từng chuyển động bay bổng của tà váy cho dồi dào năng lượng nữ tính ngọt ngào quyến rũ.`,
        highlight: "Một đôi giày tốt dẫn lối bạn bước tới những chân trời sầm uất xinh đẹp lộng lẫy.",
        list: ["Sắm sẵn một đôi cao gót mũi nhọn màu nude tệp da chân mướt mát tôn chiều tốt", "Kiểm tra kỹ miếng lót cao su chống trượt trầy xót gót hồng chân mộc mạc thơm", "Tối giản màu sắc giày bám quanh 3 gam kinh điển đen tuyền, trắng sữa, nude bò"]
      },
      {
        p1: `Khám phá vẻ đẹp phóng khoáng hoang dã của chất liệu đũi Linen cao cấp - hơi thở của tự nhiên cho mùa hè nhiệt đới Việt Nam nóng bức. Hãy ưu tiên chọn trang phục linen dệt sợi dày dặn bo viền kỹ, là ẩm bằng bàn là hơi nước lật nếp tà đứng phom sang xịn mịn thong dong.`,
        p2: `Mục đích là giúp làn da được thở thảnh thơi mát mẻ thấm hút mồ hôi tối đa, tôn vinh nét đẹp thả lỏng thảnh thơi an nhàn quý tộc mà không bê bối nhếch nhác.`,
        highlight: "Vết nhăn nhẹ tự nhiên của linen cao cấp thể hiện sự thả lỏng thư thái vô cùng quý.",
        list: ["Chọn vải linen sợi thuần chủng tự nhiên dệt dày bản tránh lộ nội y sến mỏng", "Sử dụng nước giặt trung tính vắt nhẹ tay phơi ngang sào xích tránh chảy sợi xệ", "Phối đồ vải đũi kèm nón cói mộc túi mây đan chuẩn ngút ngàn phong vị nghỉ mát rực"]
      },
      {
        p1: `Biến đổi linh hoạt phong cách ăn mặc từ trang phục công sở ban ngày sang phục sức tiệc tối lộng lẫy quyến rũ nhanh chóng rảnh rang dạt dào. Hãy mặc lót chiếc váy lụa đen hai dây quyến rũ bên trong, khoác ngoài chiếc Blazer phom lịch sự đóng cúc nghiêm túc khi làm việc văn phòng.`,
        p2: `Mục đích là tối ưu hóa quỹ thời gian bận rộn hằng ngày của quý cô hiện đại, chỉ cần cởi blazer và dặm tí son đỏ mọng lấp lánh dạt dào ánh sao là sẵn sàng bay bổng tiệc túng.`,
        highlight: "Biến hóa phong cách linh hoạt thể hiện trí tuệ thời trang biến hóa nhạy bén dào.",
        list: ["Bỏ dự phòng thắt lưng kim loại khuyên tai to bản lấp lánh trong ngăn kéo túi", "Thay thế đôi giày bệt công sở bằng giày gót nhọn kiêu kỳ 7 phân rực sáng gót", "Thương xức một chút nước hoa gỗ sâu ấm bí ẩn cho một đêm tiệc rực rỡ ngọt ngào"]
      },
      {
        p1: `Trị triệt để khuyết điểm ngấn bụng khi diện đầm váy lụa satin mỏng manh chảy rủ dễ phản chủ phơi bầy vết bập bùng sần sùi béo béo sần xấu. Bạn hãy thông minh lựa chọn chất lụa dệt mờ satin bias-cut cắt xéo vải rủ gợn sóng mờ ảo thướt tha.`,
        p2: `Mục đích là dùng cấu trúc vải nương bóng mờ gợn sóng để che khuất hoàn toàn khuyết điểm mỡ thừa vô lý, đem lại diện mạo S-line phẳng phiu quyến rũ rực rỡ nhất.`,
        highlight: "Vải lụa cắt xéo bias-cut mượt mà uốn lượn giấu bụng mỡ thần sầu quyến rũ.",
        list: ["Mặc lót cùng quần sịp tàng hình không dải viền gờ thô cứng sần sùi sùi quê", "Lựa chọn cạp váy thiết kế thêu thắt nhẹ che giấu vùng rốn mộc mạc che phủ", "Tự tin thẳng vai ưỡn ngực tạo dòng s-line visual quyến rũ tự nhiên kiêu kỳ tôn"]
      },
      {
        p1: `Bảo quản nâng niu quần áo đắt tiền may đo để giữ form chuẩn spa bền bỉ dẻo dai tuyệt đối lâu dài năm tháng. Hãy cất giã từ các móc sắt nhọn hoắt sần sùi sùi gỉ sét, thay bằng móc treo gỗ bản múp bo tròn xoa vai áo vest chuẩn chỉ ranh mãnh rành mạch bảo quản.`,
        p2: `Mục đích là ngăn ngừa biến dạng hư hại thớ vải tơ quý, giữ tà đứng phom chuẩn lộng lẫy và phản ánh phong thái ngăn nắp tôn trọng bản thân dạt dào thịnh vượng tài lộc.`,
        highlight: "Nâng niu nâng niu trang phục phản ánh trực diện nếp sinh hoạt chuẩn mực cao quý.",
        list: ["Tuyệt đối không tống sấy nhiệt độ cao đồ tơ tằm len lụa co rút xơ xác rách vụn", "Mỗi tủ áo quần bắt buộc cất sẵn túi hạt hút ẩm mốc ẩm phòng mốc thối hỏng đồ", "Dung nạp giặt khô là hơi chuyên nghiệp cho các dòng len dạ măng tô xa xỉ nhất"]
      },
      {
        p1: `Khám phá bí quyết chọn sắm và sử dụng kính râm thời trang phù hợp từng phom khuôn mặt. Hãy chọn gọng kính phi công cổ điển cá tính dạt dào sang chảnh, hoặc mắt kính mắt mèo xếch kiêu sa tôn vinh trọn vẹn dải visual rực rỡ dạt dào tài lộc.`,
        p2: `Mục đích là bảo vệ đôi mắt ngọc tơ mộc khỏi tia cực tím tàn phá gây nếp nhăn đuôi mắt, đồng thời tạo nét thu hút thần thái bí ẩn cuốn hút tuyệt đỉnh của quý cô sành điệu.`,
        highlight: "Kính mát xịn đen láu là vũ khí tối thượng lột xác thần thái sang chảnh sau một nấc.",
        list: ["Đến trực tiếp cửa hàng kính thử phom gọng cân đối hài hòa cấu trúc gò má chân", "Chọn tròng kính phân cực có chỉ số chứng nhận UV400 bảo vệ giác mạc triệt de", "Ghim cài kính hờ trên cổ áo thun tạo điểm nhấn phối đồ cực kỳ phóng khoáng xịn"]
      },
      {
        p1: `Thực hiện phối đồ họa tiết da báo sành điệu hoang dã sang chảnh mà không lo sa vào bẫy sến súa lố lăng lòe loẹt bê bối mông muội sần sùi. Hãy áp dụng quy tắc 80-20 nghiêm ngặt: 80% là tông đen trung tính trơn tru trơn mịn rạng ngời, chỉ dành đúng 20% cho phụ kiện da báo như thắt lưng nhỏ, túi xách mini sành điệu dào.`,
        p2: `Mục đích là tạo điểm nhấn cá tính gai góc vừa đủ sang quý mọc sáng láng bảnh bao mà không phá vỡ nét thanh tao nhã nhặn vốn có của tổng thể.`,
        highlight: "Họa tiết da báo là vị ớt cay nồng, dùng chút ít thăng hoa dùng nhiều bỏng rát phèo.",
        list: ["Chọn thắt lưng mảnh da báo phối cùng váy lụa đen tuyền quyến rũ tối hôm nay", "Tuyệt đối không mang cả đống lắc xính xích vàng khè vòng vèo hầm hố bít bùng", "Tránh xa chất vải nylon in da báo mỏng rách co dính sần sùi sùi bẩn sầu"]
      },
      {
        p1: `Hiểu kỹ về nghệ thuật chọn lựa và sử dụng các loại nước hoa (Eau de Parfum - EDP và Eau de Toilette - EDT) hài hòa mùi hương theo mùa. Hãy thương xức nước hoa lên các dải điểm đập mạch ấm áp như cổ tay, sau gáy tai mát.`,
        p2: `Mục đích là lưu giữ và lan tỏa dải hương thơm lôi cuốn mơn man mượt mà suốt dạt dào thời gian, thể hiện mùi hương ký ức bản sắc độc bản vô song của quý cô thượng lưu.`,
        highlight: "Mùi hương nước hoa là trang phục vô hình nhưng để lại ấn tượng khắc sâu tâm trí nhất.",
        list: ["Xịt nước hoa sau khi bôi sữa dưỡng ẩm không mùi giúp lưu giữ hương lâu gấp đôi", "Tuyệt đối không chà xát cọ xát hai cổ tay vào nhau phá vỡ liên kết phân tử hương", "Cất giữ chai nước hoa trong hộp gốc khô râm phòng tránh ánh nắng hủy hoại xúc tác"]
      },
      {
        p1: `Tư duy phối đồ Linen đũi mộc mạc rực sáng tinh thần nghỉ dưỡng du ngoạn cao cấp thảnh thơi. Hãy mặc một chiếc áo sơ mi linen phom rộng rãi màu xanh ngọc bích phối cùng quần shorts thô beige mát mẻ, đầu đội nón mộc đan cói thảnh thơi dạo bãi biển vàng giong buồm dạt dào rạng ngời dạt dào sảng khoái cực độ.`,
        p2: `Mục đích là đưa tâm hồn lẫn thể xác rũ bỏ áp lực công việc xô bồ ngột ngạt đô thị, hòa nhịp cùng sóng nước mây trăng tự do giải phóng bản thân rạng rỡ mát lành.`,
        highlight: "Thời trang đũi linen nhẹ bẫng là ngôn ngữ tự tôn của tâm hồn thả lỏng bay bay.",
        list: ["Đeo xăng đan cói mềm mảnh thay đôi cao gót gò bó sần đau nhức khi đi dã ngoại", "Ưu tiên nhuộm tà màu tự thiên nhiên thanh bạch dịu nhạt tránh phẩm màu hóa học lèo", "Khóa bọc túi nilon nhỏ bọc đựng quần áo linen chống ẩm khi đi xa dã ngoại bến"]
      },
      {
        p1: `Tìm hiểu và khám phác dải sắc màu phối hợp Color Blocking đỉnh cao cho các cô nàng tương phản sặc sỡ cá tính mạnh. Bạn hãy phối các gam màu đối lập trực diện trên bánh xe sắc màu như xanh coban rực lửa phối hồng fuchsia đằm thắm sẫm mượt bằng các khối mảng mộc mạc rành mạch đứng phom.`,
        p2: `Mục đích là kích nổ năng lượng thị giác đỉnh cao dâng trào tài lộc khơi dậy niềm vui thăng hoa thị giác sầm uất, khẳng định bản lĩnh cá nhân sành mốt vượt trội không trùng lặp.`,
        highlight: "Color blocking là bức tranh sơn dầu rực rỡ dạt dào của tâm hồn khao khát sáng tạo.",
        list: ["Giới hạn tối đa phối không quá 3 gam màu chọi nhau trên cùng một outfit tổng dạt", "Giữ phom dáng trang phục hoàn toàn tối giản trơn tru phẳng phiu không bèo nhún bết", "Sử dụng giày đen xách túi trơn màu trung tính dìm bớt sự chói lóa cân bằng lại phom"]
      },
      {
        p1: `Chúc mừng bạn đã hoàn tủ cẩm thạch thời trang cán mốc 30 chương cẩm nang thời trang đón đầu xu hướng vạn người mê dạt dào tài lộc thịnh vượng rạng ngời rực rỡ nhất Việt Nam. Hãy vững tin khoác lên mình chiếc vương miện kiêu kỳ của sự tự tin sầm uất, buông bỏ định kiến rào cản cấm đoán dạt dào mượt mà.`,
        p2: `Mục đích là giúp chủ nhân thời thượng thăng hoa hoàn toàn bản sắc cá nhân vô song lộng lẫy quý tộc, mỉm cười đón nhận vạn điều cát tường dạt dào tài lộc sung túc và hạnh phúc thăng thơi.`,
        highlight: "Phong cách thời trang tự tin độc bản chính là bộ trang sức đắt giá nhất của quý cô.",
        list: ["In cẩm nang PDF đóng quyển bỏ rương làm nguồn cẩm nang phối đồ rạng rỡ bất tận", "Chia sẻ cẩm nang rạng ngời thời trang này cho các chị em bạn ruột bè kết nối yêu", "Quay thưởng hái ngay sắm lộc voucher mua sắm thời trang hiệu cao cấp hời sầm"]
      }
    ]
  };

  return extraTitles.map((item, index) => {
    const pageNum = index + 16;
    const images = [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80"
    ];

    const fallbackDetails = {
      p1: `Chào mừng bạn đến với chương số ${pageNum} chuyên sâu trong cẩm nang hướng dẫn do chuyên gia ${author} biên soạn tỉ mỉ. Tại phần này chúng ta sẽ tập trung tối đa giải pháp thúc đẩy bền vững cho hành trình phát triển ${baseTitle} của bạn.`,
      p2: `Phương pháp thực chứng rõ ràng, cam kết tương khớp 100% mục lục sẽ giúp bạn nhanh chóng hấp thụ tối đa kiến thức để bảo vệ thành quả và dòng tài chính lâu dài dồi dào rạng ngời.`,
      highlight: `Nhất quán kỷ luật hành động giải phóng tài chính của bạn tương xứng tinh hoa ${categoryName}.`,
      list: [
        `${listPrefix} số 1: Tối ưu hoá quy trình quản trị thực tiễn`,
        `${listPrefix} số 2: Rà soát phát hiện rủi ro và điều chỉnh nhanh chóng`,
        `${listPrefix} số 3: Đo lường sát sườn phản hồi hệ thống để nâng chuẩn`
      ]
    };

    const details = (topicDetails[topic] && topicDetails[topic][index]) || fallbackDetails;

    return s(
      `${pageNum}. Bước ${pageNum}: ${item[0]}`,
      `${item[1]}`,
      `${item[2]}`,
      images[index % images.length],
      details.p1,
      details.p2,
      details.highlight,
      details.list
    );
  });
}

// Dynamic custom slide generator when the user provides custom titles and prompts
export function generateCustomSlides(
  customTitle: string,
  suggestions: string,
  authorName: string,
  length: number
): GiftSlide[] {
  const imagesList = [
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1552581230-c01591d6f557?auto=format&fit=crop&w=800&q=80"
  ];

  // Extract custom user requirements list by splitting suggestions
  let userItems: string[] = [];
  if (suggestions) {
    const rawLines = suggestions
      .split(/[\n;|\r]+/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    userItems = rawLines.map(line => {
      return line
        .replace(/^[\s•\-*※○]+/g, '') // remove common bullet characters
        .replace(/^\d+[\.\s\-]+/g, '') // remove numbered prefixes like "1. ", "02 - "
        .trim();
    }).filter(item => item.length > 0);

    if (userItems.length <= 1) {
      // Split by periods if it's a paragraph
      const sentenceSplit = suggestions
        .split(/(?<=\b[a-zA-Z]{3,}\.)\s+/)
        .map(item => item.trim())
        .filter(item => item.length > 0);

      const cleanedSentences = sentenceSplit.map(line => {
        return line
          .replace(/^[\s•\-*※○]+/g, '')
          .replace(/^\d+[\.\s\-]+/g, '')
          .trim();
      }).filter(item => item.length > 4);

      if (cleanedSentences.length > 0) {
        userItems = cleanedSentences;
      }
    }
  }

  if (userItems.length === 0) {
    userItems = [customTitle || "Tài liệu theo yêu cầu"];
  }

  const getBadge = (text: string, idx: number) => {
    const lower = text.toLowerCase();
    if (lower.includes("tâm lý") || lower.includes("tư duy") || lower.includes("suy nghĩ")) return "TƯ DUY GỐC RỄ";
    if (lower.includes("kế hoạch") || lower.includes("mục tiêu") || lower.includes("định vị") || lower.includes("chiến lược")) return "CHIẾN LƯỢC PHÁT TRIỂN";
    if (lower.includes("hành") || lower.includes("làm") || lower.includes("thực") || lower.includes("bước") || lower.includes("quy trình")) return "QUY TRÌNH THỰC THI";
    if (lower.includes("tiền") || lower.includes("tài chính") || lower.includes("doanh thu") || lower.includes("thu nhập") || lower.includes("bán hàng")) return "GIẢI PHÁP TÀI CHÍNH";
    if (lower.includes("tối ưu") || lower.includes("hiệu suất") || lower.includes("tự động") || lower.includes("nhanh") || lower.includes("lười")) return "TỐI ƯU HIỆU SUẤT";
    if (lower.includes("khách") || lower.includes("đọc giả") || lower.includes("người dùng") || lower.includes("công chúng")) return "THU HÚT KHÁCH HÀNG";
    const defaults = ["BÍ QUYẾT BẢN SẮC", "ỨNG DỤNG THỰC TẾ", "MỞ KHÓA GIẢI PHÁP", "NHÂN BẢN GIÁ TRỊ", "ĐO LƯỜNG TĂNG TRƯỞNG"];
    return defaults[idx % defaults.length];
  };

  return Array.from({ length }).map((_, index) => {
    const pageNum = index + 1;
    const img = imagesList[index % imagesList.length];
    
    // Pick the corresponding customer item text
    const itemText = userItems[index % userItems.length];
    const cleanItem = itemText.replace(/[\.\?,!]+$/, '').trim();
    
    // Capitalize the first character of cleanItem
    const titleCleaned = cleanItem.charAt(0).toUpperCase() + cleanItem.slice(1);
    
    // Build distinctive slide content elements based directly on the item text
    const slideTitle = `${pageNum}. ${titleCleaned.substring(0, 60)}${titleCleaned.length > 60 ? '...' : ''}`;
    const slideSubtitle = `Chương chuyên sâu cho tài liệu "${customTitle}"`;
    const slideBadge = getBadge(itemText, index);
    
    const p1 = `Biên soạn chi tiết theo đúng yêu cầu thực tế của bạn dưới góc nhìn chuyên gia của ${authorName}: Phân tích và giải quyết triệt để nội dung "${cleanItem}". Đây là bài học thực chiến giúp bạn giải quyết từng điểm nghẽn cụ thể, thiết thực và hiệu quả nhất cho dự án của mình.`;
    
    const p2 = `Khác với những bộ đề cương hay công thức lý thuyết rập khuôn cứng nhắc, phương pháp này đòi hỏi sự định hướng linh hoạt, áp dụng đều đặn mỗi ngày kết hợp kiểm tra đo lường các chỉ số tương tác thực tế từ khách hàng để đạt độ hoàn hảo tối đa.`;
    
    const highlight = `Mỏ neo hành động: "Chính việc tập trung thực thi gãy gọn '${cleanItem.toLowerCase()}' sẽ mở ra dải kết quả chuyển đổi rực rỡ tiếp theo."`;
    
    const list = [
      `Bước 1: Triển khai chuẩn bị giải pháp định hình cho: ${cleanItem}`,
      `Bước 2: Đo lường mức độ phản hồi và điều chỉnh thích ứng linh hoạt hằng ngày`,
      `Bước 3: Tối ưu hóa cùng cẩm nang hướng dẫn đồng hành từ chuyên gia ${authorName}`
    ];
    
    return s(
      slideTitle,
      slideSubtitle,
      slideBadge,
      img,
      p1,
      p2,
      highlight,
      list
    );
  });
}

function generateCustomSlidesDeprecated(
  customTitle: string,
  suggestions: string,
  authorName: string,
  length: number
): GiftSlide[] {
  const stepTitles = [
    "Nhận diện cốt lõi ban đầu",
    "Định vị mục tiêu dài hạn",
    "Xây dựng kế hoạch nền tảng",
    "Tối ưu hóa các tài nguyên sẵn có",
    "Cơ cấu vận hành chuyên nghiệp",
    "Sắp xếp thứ tự ưu tiên gãy gọn",
    "Chuẩn hóa phương thức trao đổi",
    "Bảo mật thông tin hệ thống an toàn",
    "Tạo giá trị thặng dư bền vững",
    "Kiểm soát chi tiết và phản hồi",
    "Điều chỉnh linh hoạt theo thị trường",
    "Xây dựng đội ngũ đồng hành tin cậy",
    "Kiểm kê và đo lường trực diện hiệu năng",
    "Nhân bản mô hình thành công vững chãi",
    "Tuyên ngôn bứt phá vươn tầm cao",
    "Tự động hóa quy trình rảnh tay",
    "Chiến thuật tiếp thị mồi thu hút",
    "Quản trị dòng tiền tối ưu",
    "Nâng tầm trải nghiệm khách ruột",
    "Độc quyền hóa giải pháp bản sắc",
    "Kỹ năng thương thuyết đỉnh bùng",
    "Đo lường chỉ số ROI thực tế",
    "Gắn kết hệ sinh thái đa kênh",
    "Quản lý thời gian Batching khoa học",
    "Thấu hiểu tâm lý hành vi mua",
    "Tạo thu hút chuyển đổi tự nhiên",
    "Đẩy mạnh thương hiệu cá nhân",
    "Giải mã các thuật toán đề xuất",
    "Quản trị rủi ro khủng hoảng",
    "Khát vọng chinh phục triệu đô"
  ];

  const imagesList = [
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1552581230-c01591d6f557?auto=format&fit=crop&w=800&q=80"
  ];

  const detailsTemplates = [
    {
      badge: "TƯ DUY GỐC RỄ",
      subtitle: "Đào sâu nền móng chiến lược toàn cục",
      p1: `Để bắt đầu hành trình thành công với chủ đề "${customTitle}", bước tiên quyết chính là bóc tách và nhận diện chính xác các giá trị cốt lõi ban đầu bản thân đang nắm giữ. Tránh vội vã triển khai bề nổi mà thiếu đi cái nhìn sâu sắc về mục tiêu thực sự từ gợi ý của bạn: "${suggestions}".`,
      p2: "Hãy sắm vai nhà nghiên cứu nghiêm túc: Phân tích kỹ bức tranh tổng thể, thấu hiểu tệp khách hàng hoặc mục tiêu cần hướng tới, loại bỏ các yếu tố nhiễu loạn để thấy được điểm đòn bẩy lớn nhất của toàn bộ kế hoạch hành động.",
      highlight: "Bắt đầu từ cái gốc rễ vững vàng là điều kiện cần thiết kế hoạch sinh hoa trái dồi dào.",
      list: [
        "Xác định 3 giá trị độc bản cốt lõi phù hợp với mục tiêu đề ra",
        "Phân tích nhu cầu thực tế của đối tượng tiếp nhận tài liệu",
        "Tạo danh sách kiểm tra nhanh năng lực hiện có để tận dụng tối đa"
      ]
    },
    {
      badge: "ĐỊNH VỊ CHIẾN LƯỢC",
      subtitle: "Thiết kế tương lai và điểm chạm tham vọng",
      p1: `Không có một ngọn gió nào là thuận lợi nếu thuyền trưởng không biết rõ đích đến dài hạn của mình. Khi nghiên cứu sâu về "${customTitle}", bạn cần xác định một vị thế độc bản, một tầm nhìn xa trông rộng bám sát theo mong muốn: "${suggestions}".`,
      p2: "Một tầm nhìn tốt sẽ tạo ra nguồn cảm hứng dài lâu để bạn kiên trì bám đuổi qua những giai đoạn bão tố thử thách của thị trường. Hãy biến định vị thành bộ la bàn dẫn lối cho từng quyết định nhỏ hằng ngày chuẩn chỉ.",
      highlight: "Định vị chính xác quyết định 80% độ hiệu quả của dòng chuyển đổi hành vi.",
      list: [
        "Vẽ chân dung mục tiêu dài hạn trong 6 tháng và 1 năm tới",
        "Chọn 1 ngách chuyên sâu nhất để tập trung nguồn lực đỉnh cao",
        "Viết bản tuyên ngôn định vị độc bản phân biệt chính mình với đối thủ"
      ]
    },
    {
      badge: "NỀN MÓNG VỮNG CHÃI",
      subtitle: "Lập trình bản kế hoạch chi tiết từng dải hành động",
      p1: `Sự vĩ đại của mọi công trình luôn nằm ở sự vững chắc của lớp móng ngầm sâu dưới lòng đất. Thiết kế một hệ thống vận dụng "${customTitle}" đòi hỏi một bản kế hoạch gãy gọn, rành mạch và có tính khả thi cao, tương khớp chặt chẽ tinh thần của: "${suggestions}".`,
      p2: "Kế hoạch không cần quá rườm rà nhưng bắt buộc phải chi tiết về dòng thời gian, nhân lực phối hợp, rủi ro dự phòng để tránh việc đứt gãy giữa chừng khi gặp biến cố bất ngờ xảy đến ngoài dự tính.",
      highlight: "Kế hoạch gãy gọn giải phóng 90% lo âu và sự trì hoãn vô lý của bộ não.",
      list: [
        "Chia nhỏ mục tiêu lớn thành các nhiệm vụ tuần rành mạch dễ làm",
        "Phân bổ thời gian cố định hàng ngày để tập trung thi công dự án",
        "Thiết lập thang đo tiến độ định kỳ để sửa sai kịp thời tuần tự"
      ]
    },
    {
      badge: "TỐI ƯU NGUỒN LỰC",
      subtitle: "Vắt sạch giá trị từ những gì đang có sẵn trong chiếc ba lô",
      p1: `Nhiều người trì hoãn làm "${customTitle}" vì nghĩ mình thiếu thốn công cụ đắt đỏ hay mối quan hệ sầm uất. Đó là một ảo tưởng lớn! Bạn đang sở hữu rất nhiều tài nguyên ngầm quý giá từ gợi ý "${suggestions}" chưa thèm khai thác triệt để.`,
      p2: "Khai thác tối đa các công cụ miễn phí, các kênh truyền thông sẵn có, kiến thức tích lũy cá nhân để làm mồi thu hút lực hút ban đầu. Đừng đợi hoàn hảo mới bắt đầu, hãy bắt đầu để hoàn hảo dồi dào hơn.",
      highlight: "Sự sáng tạo đột phá luôn xuất hiện trong hoàn cảnh tài nguyên giới hạn nhất.",
      list: [
        "Kiểm kê lại toàn bộ công cụ, mối quan hệ và tài liệu hiện có",
        "Ứng dụng công nghệ miễn phí để tự động hóa 50% khâu vận hành ban đầu",
        "Đóng gói tài sản tri thức cũ thành quà tặng đi kèm thu hút tệp khách"
      ]
    },
    {
      badge: "VẬN HÀNH CHUYÊN NGHIỆP",
      subtitle: "Chuẩn hóa bộ máy làm việc trơn tru rảnh tay",
      p1: `Quản trị dự án "${customTitle}" nếu chỉ dựa vào cảm hứng nhất thời sẽ sớm nổ tung bế tắc. Bạn cần tạo dựng một nếp vận hành chuyên nghiệp, nhất quán, có kỷ luật tương đồng hướng dẫn: "${suggestions}".`,
      p2: "Sự chuyên nghiệp thể hiện ở cách bạn sắp đặt thời gian biểu, lưu trữ tài liệu logic, cam kết giữ đúng lịch trình đã vạch ra bất kể tâm trạng vui buồn hằng ngày thế nào.",
      highlight: "Cảm hứng là thứ tốt để bắt đầu, nhưng kỷ luật mới đưa bạn về đích viên mãn.",
      list: [
        "Xây dựng khung giờ vàng làm việc không điện thoại phiền nhiễu",
        "Sử dụng công cụ quản trị hiện đại để kiểm duyệt tiến trình",
        "Tự thưởng xứng đáng khi hoàn thành xong các cột mốc quan trọng"
      ]
    },
    {
      badge: "ALIGNED PRIORITIES",
      subtitle: "Chọn việc hệ trọng nhất để hành quyết dứt khoát",
      p1: `Bẫy của sự bận rộn vô nghĩa làm tiêu tán 90% sinh lực của bạn. Khi dấn thân triển khai "${customTitle}", bạn phải biết cách sắp xếp thứ tự ưu tiên gãy gọn, tập trung xử lý dứt điểm những việc tạo ra kết quả đột phá theo tinh thần: "${suggestions}".`,
      p2: "Ứng dụng nguyên lý Pareto 80/20: Tìm ra 20% đầu việc cốt lõi tạo ra 80% giá trị bứt phá dài lâu, dốc toàn lực xử lý chúng vào buổi sáng và gạt bỏ mọi sự phân tâm không đáng có sang một bên.",
      highlight: "Biết từ chối những việc phụ là nghệ thuật để làm tốt những việc chính yếu.",
      list: [
        "Liệt kê tối đa đúng 3 việc quan trọng nhất cần hoàn tất trong ngày",
        "Làm việc khó nhất ngay khi thức dậy với năng lượng cao nhất",
        "Từ chối các cuộc gọi, tin nhắn không liên quan trong giờ tập trung"
      ]
    },
    {
      badge: "GIAO TIẾP HIỆU QUẢ",
      subtitle: "Tạo nhịp cầu kết nối lòng tin bền vững",
      p1: `Dù là chia sẻ kiến thức hay thương mại hóa "${customTitle}", dải thông tin truyền tải phải luôn ở mức đơn giản, dễ hiểu nhất cho người tiếp nhận từ đề xuất: "${suggestions}".`,
      p2: "Tránh dùng những thuật ngữ đao to búa lớn gây xa cách. Hãy kể câu chuyện chạm sâu vết đau thực tế, đưa giải pháp trực diện ngọt ngào để người nghe cảm thấy được bảo bọc thấu hiểu.",
      highlight: "Giao tiếp thành công là khi một đứa trẻ 10 tuổi cũng hiểu rõ bạn đang nói gì.",
      list: [
        "Đơn giản hóa toàn bộ các thuật ngữ kỹ thuật phức tạp khó hiểu",
        "Sử dụng sơ đồ trực quan hoặc ví dụ cụ thể để minh họa lời nói",
        "Lắng nghe phản hồi từ tệp đối tượng để điều chỉnh cách truyền tải"
      ]
    },
    {
      badge: "BẢO MẬT HỆ THỐNG",
      subtitle: "Bọc lót lá chắn an toàn cho toàn bộ tài sản số",
      p1: `Công sức xây dựng tài liệu "${customTitle}" sẽ đổ sông đổ bể nếu bạn lơ là bảo mật an toàn thông tin, đặc biệt trong thời đại số hóa đầy rẫy rủi ro quét mốc từ suggestions: "${suggestions}".`,
      p2: "Hãy trang bị tư duy phòng thủ kiên cố: Sao lưu dữ liệu thường xuyên lên mây đa nền tảng, thiết lập mật khẩu mạnh mẽ, kiểm tra kỹ lưỡng các quyền truy cập hệ thống để tránh thất thoát vô lý.",
      highlight: "Phòng bệnh hơn chữa bệnh, bảo an dữ liệu là bảo vệ sinh mệnh dòng tài chính.",
      list: [
        "Kích hoạt bảo mật 2 lớp cho tất cả tài khoản lưu trữ tài liệu mật",
        "Sao lưu dữ liệu tự động định kỳ hàng tuần tránh mất mát khi lỗi máy",
        "Giới hạn quyền chỉnh sửa tài liệu, chỉ chia sẻ quyền đọc an toàn"
      ]
    },
    {
      badge: "TẠO GIÁ TRỊ THẶNG DƯ",
      subtitle: "Cho đi hào phóng gieo mầm hoa trái tài lộc",
      p1: `Bí mật tối cao của kinh doanh thông minh là tạo ra giá trị thặng dư vượt quá sự mong đợi của người nhận. Khi thiết lập quà tặng về "${customTitle}", hãy lồng ghép những kiến thức tinh hoa đột phá nhất lấy cảm hứng tự: "${suggestions}".`,
      p2: "Sự hào phóng chân thành luôn thu hút lòng trung thành tuyệt đối của khách hàng. Hãy biến tài liệu này thành cuốn cẩm nang gối đầu giường khiến họ rung cảm sâu sắc và nhớ đến thương hiệu của bạn mãi mãi.",
      highlight: "Muốn nhận lại dồi dào, hãy bắt đầu bằng việc cho đi tinh khiết không toan tính.",
      list: [
        "Tặng kèm một bộ giải pháp hoặc danh mục công cụ thực chiến kèm theo",
        "Đảm bảo bố cục hiển thị mướt mắt, dễ đọc, mang tính ứng dụng cao",
        "Tích hợp mã ưu đãi đặc quyền cho các sản phẩm chuyên sâu tiếp theo"
      ]
    },
    {
      badge: "RÀ SOÁT - ĐIỀU CHỈNH",
      subtitle: "Lắng nghe nhịp thở của phản hồi thực tế",
      p1: `Sự bảo thủ chính là cái chết êm ái của nhà sáng tạo. Khi phát hành "${customTitle}", bạn cần theo dõi sát sao phản hồi, đọc kỹ các dải chữ góp ý để không ngừng nâng cao chất lượng từ đề xuất: "${suggestions}".`,
      p2: "Hãy bình thản đón nhận những lời đóng góp rành mạch để hiểu rõ mong muốn thực chứng của tệp người dùng, từ đó lập tức bổ sung điều chỉnh nội dung hoàn hảo dạt dào sinh khí mới.",
      highlight: "Bản báo cáo đóng góp chính là chiếc gương soi chân thực giúp bạn sửa sang dung nhan.",
      list: [
        "Tạo link khảo sát ngắn gọn thu thập ý kiến người đọc cẩm nang",
        "Rà soát chỉ số mở tài liệu hằng tuần để đo lường độ gắn kết của thu hút",
        "Cập nhật nội dung mới định kỳ bổ sung xu hướng thời đại bùng nổ"
      ]
    },
    {
      badge: "SỰ KHẢ QUAN THỊ TRƯỜNG",
      subtitle: "Lướt trên làn sóng xu hướng thay đổi liên tục",
      p1: `Thị trường xoay trục chóng mặt từng ngày. Dự án "${customTitle}" của bạn bắt buộc phải có sự dẻo dai thích ứng linh hoạt, không cứng nhắc bảo thủ trước bối cảnh: "${suggestions}".`,
      p2: "Quan sát động thái của những người dẫn đầu ngành, nắm bắt kịp thời công nghệ AI hay thuật toán mới để tích hợp luồn lách đưa tài liệu của bạn luôn ngự trị ở ngôi vương xu hướng tiêu dùng.",
      highlight: "Kẻ sống sót cuối cùng không phải kẻ mạnh nhất, mà là kẻ nhanh nhẹn thích nghi nhất.",
      list: [
        "Dành 30 phút hằng ngày đọc tin tức chuyên ngành đón đầu xu hướng mới",
        "Thử nghiệm nhanh các kênh tiếp cận mới như Reels, Short để thu hút thu hút",
        "Chuyển hóa nhanh ý tưởng hot trend hợp thị hiếu vào bộ quà tặng tức thì"
      ]
    },
    {
      badge: "ĐỒNG ĐỘI TIN CẬY",
      subtitle: "Sử dụng đòn bẩy con người vượt quy mô giới hạn",
      p1: `Một cánh én nhỏ chẳng thể làm nên mùa xuân rực rỡ dạt dào. Để đưa tầm vóc vận hành "${customTitle}" vươn xa tầm đại triệu đô, bạn cần học cách liên kết cộng sự tin cậy phù hợp mục lục: "${suggestions}".`,
      p2: "Chia sẻ bớt công việc hậu kỳ biên tập cho trợ lý hoặc cộng tác viên để giải phóng 100% thời gian của bạn vào khâu tư duy chiến lược vàng ngọc kiếm tiền dồi dào.",
      highlight: "Muốn đi nhanh hãy đi một mình, muốn đi thật xa hãy đi cùng đồng đội.",
      list: [
        "Xây dựng quy trình làm việc chuẩn SOP để bất cứ ai cũng tự đóng gói tốt",
        "Tìm kiếm các KOC, đối thủ nhỏ hợp tác chéo liên kết tệp khán giả",
        "Trao quyền tự quyết đi kèm cơ chế hoa hồng hào phóng khích lệ tinh thần"
      ]
    },
    {
      badge: "ĐO LƯỜNG - KIỂM TOÁN",
      subtitle: "Tin vào con số thực chứng không nói dối",
      p1: `Làm kinh doanh hay sáng tạo về "${customTitle}" nếu chỉ dựa vào cảm giác mơ hồ sẽ sớm chuốc lấy thất bại thảm hại. Hãy dùng chỉ số để đo lường bám sát: "${suggestions}".`,
      p2: "Theo dõi lượng tải về thực tế, tỷ lệ truy cập link affiliate và số tiền hoa hồng thực thu từng ngày để biết rõ kênh nào đang sinh lời tốt nhất và kênh nào đang lãng phí nhân lực vô ích.",
      highlight: "Cái gì đo lường được thì cái đó mới cải tiến và tăng trưởng vỡ òa được.",
      list: [
        "Báo cáo chi tiết thu nhập thụ động hằng tuần so sánh với mục tiêu đề ra",
        "Tính toán chi phí thời gian bỏ ra so với hiệu quả thực tế thu hồi",
        "Sửa chữa dứt điểm khâu rò rỉ chuyển đổi ở các bước trung gian của thu hút"
      ]
    },
    {
      badge: "NHÂN BẢN THÀNH CÔNG",
      subtitle: "Khuếch đại quy mô gấp 10 lần tự động",
      p1: `Khi đã có công thức tạo dòng thu nhập từ dự án "${customTitle}" suôn sẻ, việc của bạn không phải là cặm cụi tự làm thủ công mãi mãi mà là nhân bản hệ thống đó dạt dào dựa theo: "${suggestions}".`,
      p2: "Sử dụng triệt để đòn bẩy tự động hóa, mở thêm nhiều vệ tinh phụ để phủ sóng đa kênh, đưa dòng chảy tài chính thụ động của bạn phình to bền bỉ rực rỡ suốt ngày đêm.",
      highlight: "Nhân bản thông minh giải phóng sức lao động để làm chủ dòng tự do thực sự.",
      list: [
        "Đóng gói quy trình tạo thu hút thành một sơ đồ mẫu cực kỳ trực quan",
        "Thiết lập chuỗi email/tin nhắn chăm sóc khách tự động hoàn toàn rảnh tay",
        "Khởi chạy thêm 2 kênh vệ tinh cùng ngách để tối ưu tệp người nghe mới"
      ]
    },
    {
      badge: "TUYÊN NGÔN BỨT PHÁ",
      subtitle: "Chạm tay tới đỉnh vinh quang sừng sững rạng ngời",
      p1: `Chúc mừng bạn đã xuất sắc đi trọn 15 chương đầu tiên vô cùng tinh túy của cẩm nang chuyên sâu "${customTitle}" do chuyên gia thiết lập từ mong muốn: "${suggestions}".`,
      p2: "Hãy ghi nhớ rõ ràng: Kiến thức tuyệt diệu nhất vẫn chỉ là mớ giấy lộn vô nghĩa nếu bạn thiếu đi kỷ luật hành động dứt khoát hôm nay. Bước ra khỏi vùng an toàn để vươn tầm cao mới rực rỡ!",
      highlight: "Vạch xuất phát là ngay hôm nay, hãy tự tin cầm cương làm chủ tương lai dạt dào.",
      list: [
        "In ra cẩm nang trực quan này dán lên bàn làm việc hàng ngày tra học",
        "Cam kết kỷ luật đăng tải tối thiểu 1 video/bài viết giá trị mỗi ngày",
        "Tham gia hội hỗ trợ nhận cập nhật thông tin quà tặng đặc quyền VIP"
      ]
    },
    {
      badge: "HỆ THỐNG AUTOMATION",
      subtitle: "Xây dựng cỗ máy gửi thư tự động vận hành rảnh tay",
      p1: `Nâng cấp cẩm nang "${customTitle}" lên tầm cao mới bằng cách ứng dụng hệ thống Auto-respond tự động. Khách hàng sẽ nhận quà tức thì bất kể lúc nửa đêm nhờ các API thông tin tích hợp theo yêu cầu: "${suggestions}".`,
      p2: "Quy trình khép kín giúp bạn tiết kiệm hàng chục tiếng đồng hồ trả lời tin nhắn rườm rà hằng ngày, tạo thiện cảm chuyên nghiệp tối đa thu hút khách hàng trung thành.",
      highlight: "Cỗ máy tự động kiếm tiền nuôi bạn ngay cả khi bạn đang ngủ say.",
      list: [
        "Cài đặt Chatbot tự động gửi link quà tặng khi khách comment từ khóa",
        "Tự động đồng bộ thông tin khách nhận quà vào Google Sheets quản trị",
        "Gửi chuỗi email tri ân khách hàng tự động sau khi nhận cẩm nang 3 ngày"
      ]
    },
    {
      badge: "TIẾP THỊ THU HÚT MỒI",
      subtitle: "Nghệ thuật thu hút khách hàng tự nguyện tìm đến",
      p1: `Đừng đi chèo kéo van nài khách mua hàng nữa! Hãy tạo ra chiếc thu hút mồi dồi dào giá trị về "${customTitle}" khiến họ khao khát có được theo định hướng của suggestions: "${suggestions}".`,
      p2: "Sự thèm khát sở hữu kiến thức hữu dụng sẽ thôi thúc khách hàng sẵn lòng để lại thông tin cá nhân và cookie tiếp thị, mở đường cho những chiến dịch bán hàng khủng phía sau.",
      highlight: "Người bán hàng thông thái gieo hạt giá trị trước khi hái quả tài lộc.",
      list: [
        "Sáng tạo 1 trang bìa cẩm nang cực kỳ bắt mắt thu hút ánh nhìn",
        "Nhắc nhở nhận quà miễn phí liên tục ở cuối các video xu hướng",
        "Tạo độ khan hiếm giả định để kích thích khách nhấn tải tài liệu nhanh"
      ]
    },
    {
      badge: "QUẢN TRỊ DÒNG TIỀN",
      subtitle: "Dòng tài chính dồi dào tuần hoàn lành mạnh",
      p1: `Làm kinh doanh "${customTitle}" mà bỏ qua việc quản lý chi thu rạch ròi sẽ sớm rơi vào cảnh rỗng ví mệt mỏi mặc dù doanh thu có khủng đến mấy bấu víu từ: "${suggestions}".`,
      p2: "Phần chia rạch ròi giữa dòng tiền tái đầu tư sản xuất nội dung quảng cáo và lợi nhuận cá nhân thực tế giúp bạn luôn trong trạng thái chủ động về ngân sách tài chính vững bền dồi dào.",
      highlight: "Quản trị tiền thông minh là giữ được tiền chứ không chỉ là kiếm được nhiều tiền.",
      list: [
        "Mở tài khoản ngân hàng riêng biệt chuyên thu nhận hoa hồng affiliate",
        "Cố định trích xuất 10% doanh thu tái đầu tư vào công cụ và khóa học chất",
        "Thống kê chi tiết lợi nhuận ròng vào ngày cuối cùng của tháng rành mạch"
      ]
    },
    {
      badge: "CHĂM SÓC KHÁCH RUỘT",
      subtitle: "Nâng niu tệp fan ruột mang dòng tiền tái đầu tư",
      p1: `Khách hàng cũ đem lại 80% lợi nhuận lâu dài cho bạn. Khi họ đã tải cẩm nang về "${customTitle}" của bạn, đừng bỏ rơi họ! Hãy luôn dõi theo và hỗ trợ bám sát: "${suggestions}".`,
      p2: "Sự nhiệt tình thăm hỏi chân thành biến một người lạ hoắc thành fan cuồng nhiệt tình luôn ưu tiên mua sắm qua dải link tiếp thị của bạn để ủng hộ danh tiếng bạn bền lâu.",
      highlight: "Một khách hàng trung thành đáng giá hơn một trăm lượt xem lướt qua thờ ơ.",
      list: [
        "Gửi thư điện tử thăm hỏi tiến độ áp dụng kiến thức sau 7 ngày",
        "Tổ chức các buổi hỏi đáp trực tuyến miễn phí giải quyết khó khăn",
        "Tặng mã chiết khấu đặc quyền tri ân riêng cho tệp khách đã đồng hành"
      ]
    },
    {
      badge: "ĐỘC QUYỀN BẢN SẮC",
      subtitle: "Xây dựng bức tường lửa thương hiệu vững vàng",
      p1: `Để không bị hòa tan trong đại dương bão bùng hiện tại, dự án "${customTitle}" của bạn cần có một màu sắc độc quyền không thể sao chép dựa theo: "${suggestions}".`,
      p2: "Hãy định vị phong cách bằng tông màu đại diện, cách nói chuyện duyên dáng riêng biệt, hoặc những câu chốt hạ thương hiệu mang tính chất kéo giật sự nhớ thương của người nghe sâu đậm.",
      highlight: "Khác biệt hay là chết, luôn giữ vững cái tôi bản sắc rực rỡ độc bản.",
      list: [
        "Thiết kế bộ nhận diện logo, màu sắc chuyên biệt thống nhất đa kênh",
        "Luyện tập một câu khẩu hiệu chào kết thương hiệu đặc trưng hóm hỉnh",
        "Chia sẻ những quan điểm cá nhân thẳng thắn tạo lòng tin mạnh mẽ"
      ]
    },
    {
      badge: "THƯƠNG THUYẾT ĐỈNH CAO",
      subtitle: "Deal hoa hồng độc quyền dẫn đầu thị trường",
      p1: `Khi kênh của bạn đã có tệp khán giả tin tưởng cẩm nang "${customTitle}", hãy tự tin đàm phán với nhãn hàng để nâng mức chiết khấu tốt nhất tương hợp ý kiến: "${suggestions}".`,
      p2: "Thương lượng thông minh bằng các con số CTR thực tế, chứng minh sự uy tín chuyên gia của kênh để đạt thỏa thuận hoa hồng VIP vượt trội hơn hẳn đối thủ cạnh tranh rườm rà.",
      highlight: "Bạn không có được thứ bạn xứng đáng, bạn chỉ có được thứ bạn đàm phán được.",
      list: [
        "Tổng hợp bảng chỉ số view và tương tác thực tế của 5 clip tốt nhất",
        "Liên hệ xin mã giảm giá độc quyền mang tên của chính bạn tặng fan",
        "Ký kết hợp đồng đại sứ thương hiệu độc quyền ngách mang dòng thụ động"
      ]
    },
    {
      badge: "ĐO LƯỜNG ROI THỰC",
      subtitle: "Hiệu suất dòng vốn sinh lời chính xác tuyệt đối",
      p1: `Rà soát hiệu suất thời gian và tiền bạc bỏ ra cho dự án "${customTitle}". Cam kết từng đồng vốn hay giọt mồ hôi của bạn đều mang lại tỷ suất lợi nhuận ROI mỹ mãn bám theo: "${suggestions}".`,
      p2: "Bỏ qua các chỉ số ảo như lượt tym, lượt xem lướt. Tập trung triệt để vào tỷ lệ chuyển đổi cuối cùng ra tiền thật để cân đối phân bổ tài nguyên tối dồi dào tinh hoa hơn hằng ngày.",
      highlight: "Kinh doanh thông hỷ là nhìn vào túi tiền thực tế chứ không mơ màng hào nhoáng.",
      list: [
        "Tính toán chi phí cho mỗi lời nhắn hoặc lượt tải quà tặng thực tế",
        "Tập trung đầu tư tiền của vào những ngách đem lại tỷ lệ ROI trên 50%",
        "Cắt bỏ dứt khoát những dự án tốn thời gian nhưng sinh lời còm cõi"
      ]
    },
    {
      badge: "ĐA KÊNH PHỦ SÓNG",
      subtitle: "Hệ sinh thái bủa vây chiếm lĩnh tâm trí khách",
      p1: `Đừng bỏ trứng vào một chiếc giỏ lỏng lẻo! Phát triển hệ sinh thái đa kênh chuyên nghiệp phủ sóng về chủ đề "${customTitle}" để đón đầu dòng khách từ suggestions: "${suggestions}".`,
      p2: "Một nội dung hãy biến hóa thành nhiều dạng: video ngắn cho Tiktok, bài viết dài cho Group Facebook, hình ảnh tóm tắt cho Instagram để phủ sóng toàn diện giăng bẫy tệp khách.",
      highlight: "Sự hiện diện lặp đi lặp lại củng cố vị thế chuyên gia đỉnh cao của bạn.",
      list: [
        "Tự động chuyển đổi kịch bản video ngắn thành bài viết blog chi sâu",
        "Phân phối nội dung đồng loạt lên Fanpage, Group, Threads cùng giờ vàng",
        "Dẫn dắt dòng người qua lại chéo giữa các nền tảng giữ chân trong ao nhà"
      ]
    },
    {
      badge: "BATCHING TIME",
      subtitle: "Quay dựng công nghiệp hóa tiết kiệm 80% sức lực",
      p1: `Quay phim hay biên tập bài viết "${customTitle}" lắt nhắt mỗi ngày sẽ vắt kiệt sinh khí sáng tạo của bạn. Hãy gom nhóm công việc một cách khoa học dựa theo: "${suggestions}".`,
      p2: "Dành trọn vẹn duy nhất ngày thứ 7 để quay liên tiếp 10 video ngắn, chủ nhật dùng để edit chỉnh sửa phụ đề tự động hóa và lên lịch đăng tải tự động suốt tuần sau rảnh rang nghỉ ngơi sướng thân.",
      highlight: "Sắp xếp thông thái chính là bí quyết giải phóng tự do tối đa cho nhà sáng tạo.",
      list: [
        "Lên sẵn tối thiểu 7 kịch bản chi tiết trước ngày quay thực tế",
        "Setup góc quay ánh sáng cố định để tiết kiệm thời gian chuẩn bị máy",
        "Lên lịch đăng tải tự động (Schedule) trên dải công cụ quản lý của sàn"
      ]
    },
    {
      badge: "TÂM LÝ HỌC HÀNH VI",
      subtitle: "Nắm bắt mong muốn thầm kín tận đáy tim khách",
      p1: `Sức mạnh của cẩm nang "${customTitle}" nằm ở việc nó chạm đúng sợi dây thần kinh cảm xúc thầm kín của khách hàng, giải quyết dứt điểm điều họ trăn trở từ suggestions: "${suggestions}".`,
      p2: "Khách hàng không mua tính năng của sản phẩm, họ mua cảm giác an toàn, sự tự tin rạng rỡ và tương lai tốt đẹp mà sản phẩm mang lại. Thấu hiểu tâm lý này để viết bài thôi miên.",
      highlight: "Bán hàng là nghệ thuật giải quyết nỗi đau thầm kín của khách bằng tình yêu.",
      list: [
        "Nghiên cứu 10 nỗi băn khoăn trăn trở lớn nhất của người nghe hằng tối",
        "Sử dụng ngôn từ giàu hình ảnh, cảm giác kích thích khát khao sở hữu",
        "Xây dựng câu chuyện nhập vai đầy kịch tính khiến khách xúc động mạnh"
      ]
    },
    {
      badge: "THU HÚT CHUYỂN ĐỔI CHUẨN",
      subtitle: "Dẫn dắt khách hàng tự động xuống giếng mua sắm",
      p1: `Học cách thiết kế dải thu hút lọc thông minh cho "${customTitle}" để thanh lọc tệp người quan tâm hời hợt, chỉ giữ lại những vị khách chất lượng sẵn lòng mở ví ủng hộ dựa theo: "${suggestions}".`,
      p2: "Dẫn dắt tự nhiên từ quà tặng miễn phí rạng ngời đến sản phẩm thu hút giá rẻ dưới mốc 99k, rồi nhẹ nhàng đưa sang dải combo cao cấp dồi dào lợi nhuận mà khách không hề có cảm giác bị ép buộc.",
      highlight: "Chiếc thu hút chuẩn chỉnh tự động chuyển hóa người lạ thành khách cuồng hâm mộ.",
      list: [
        "Thiết lập trang thu thập email/số điện thoại cực kỳ tối giản mượt mà",
        "Tích hợp dải liên kết affiliate ở mọi điểm tiếp xúc có giá trị lớn",
        "Sử dụng kỹ thuật đo lường tỷ lệ rớt thu hút để tối ưu hóa nút bấm mua"
      ]
    },
    {
      badge: "THƯƠNG HIỆU CÁ NHÂN",
      subtitle: "Tấm hộ chiếu vạn năng đi thẳng vào lòng tin",
      p1: `Trong thế giới bão bùng hiện tại, người ta mua hàng vì TIN TƯỞNG người bán hơn là tính năng món đồ. Hãy nỗ lực xây dựng thương hiệu cá nhân sáng ngời về "${customTitle}" tương khớp: "${suggestions}".`,
      p2: "Một khuôn mặt sáng sút, giọng nói ấm áp rõ ràng, phong thái lịch thiệp tử tế luôn là thứ nam châm hút khách mạnh mẽ nhất dồi dào. Đừng trốn sau các bức hình mạng vô danh nữa.",
      highlight: "Thương hiệu cá nhân là tài sản vô giá không bao giờ bị đối thủ cướp đoạt.",
      list: [
        "Sử dụng ảnh đại diện (avatar) chính chủ, chất lượng HD rõ nét thân thiện",
        "Đồng nhất chia sẻ câu chuyện vượt khó có thật của chính cuộc đời bạn",
        "Duy trì tương tác trực tiếp, trả lời bình luận thân tình ấm áp hằng đêm"
      ]
    },
    {
      badge: "GIẢI MÃ ROBOT AI",
      subtitle: "Huấn luyện thuật toán đẩy video lên triệu lượt xem",
      p1: `Đừng cãi nhau chấp nhặt với robot phân phối nội dung của mạng xã hội. Hãy thấu hiểu luật chơi để đưa dự án "${customTitle}" bùng nổ view từ suggestions mục tiêu: "${suggestions}".`,
      p2: "Học cách giữ chân người dùng xem hết 70% thời lượng clip bằng cách chèn dải mỏ neo tò mò mọc rễ ở giữa video, thúc đẩy thuật toán robot phân phát video của bạn đến tệp rộng hơn tự động.",
      highlight: "Hiểu rõ luật chơi của robot để vắt kiệt lượt xem miễn phí khổng lồ hằng ngày.",
      list: [
        "Theo dõi sát sao chỉ số giữ chân khán giả giây thứ 3 và giây thứ 15",
        "Chủ động ghim ý kiến kích thích tranh luận văn minh dưới phần bình luận",
        "Áp dụng cấu trúc lặp vòng lặp video (Loop) thôi miên xem lại hai lần"
      ]
    },
    {
      badge: "BẢO VỆ THÀNH QUẢ KHỦNG",
      subtitle: "Giữ vững tinh thần thép vượt qua khủng hoảng",
      p1: `Hành trình rực rỡ với "${customTitle}" không tránh khỏi những đợt bão quét chính sách hay bão chỉ trích ác ý dập dồn từ suggestions: "${suggestions}".`,
      p2: "Hãy bình thản đứng vững trên đôi chân của mình: Giữ phong thái lịch sự nhất mực, tuyệt đối không đôi co cãi vã thô tục trên mạng làm tổn hại uy tín cá nhân quý báu chuẩn chỉnh tuyệt hảo.",
      highlight: "Tấm lòng bao dung và phong thái điềm tĩnh dập tắt mọi ngọn lửa phá hoại.",
      list: [
        "Đóng cửa bình luận hoặc xóa nhanh những bình luận mang tính xúc phạm bẩn",
        "Luôn có phương án lập kênh dự phòng truyền thông đề phòng sập tài khoản",
        "Lấy chất lượng phục vụ và đóng góp thực tế làm lá chắn bảo vệ uy tín"
      ]
    },
    {
      badge: "KHÁT VỌNG TRIỆU ĐÔ BỀN",
      subtitle: "Làm chủ định mệnh tài chính rạng rực trọn đời",
      p1: `Chào mừng bạn đã chạm tay đến dải chương 30 viên mãn tối thượng của cuộc hành trình đột phá "${customTitle}" do tác giả ${authorName} soạn thảo theo gợi ý: "${suggestions}".`,
      p2: "Bạn đã được trang bị đầy đủ dải súng đạn chiến lược cực kỳ thực chiến. Việc còn lại duy nhất là bật công tắc khởi chạy hành quyết bản thân kiên định ròng rã suốt 21 ngày tới để gặt hái dòng tiền dạt dào.",
      highlight: "Tương lai rực rỡ đang dang rộng vòng tay đón đợi dấu chân anh hùng của bạn!",
      list: [
        "Bấm in tài liệu này đặt ngay cạnh bàn ngủ nhắc nhở ý chí dứt khoát hằng đêm",
        "Tham gia nhận quà tri ân đặc quyền VIP dành riêng cho người kiên trì",
        "Bắt tay vào quay video đầu tiên hoặc viết bài đầu tiên ngay trong tối nay"
      ]
    }
  ];

  return Array.from({ length }).map((_, index) => {
    const pageNum = index + 1;
    const currentTitle = stepTitles[index % stepTitles.length];
    const detail = detailsTemplates[index % detailsTemplates.length];
    
    return s(
      `${pageNum}. Chương ${pageNum}: ${currentTitle}`,
      detail.subtitle,
      detail.badge,
      imagesList[index % imagesList.length],
      detail.p1,
      detail.p2,
      detail.highlight,
      detail.list
    );
  });
}

export function getSlidesForTopic(
  topic: string,
  author: string,
  customTopicName?: string,
  customTopicContentSuggested?: string,
  length: number = 15
): { title: string; category: string; slides: GiftSlide[] } {
  let title = '';
  let category = '';
  let slides: GiftSlide[] = [];

  const authorName = author || 'Hệ thống Tiếp thị Liên Kết Thông Minh';

  if (topic === 'affiliate_guide') {
    title = 'Bí Kíp Xây Kênh Affiliate Tiktok & Shopee Nghìn Đơn';
    category = 'TTLK / Affiliate';
    slides = [
      s(
        "1. Khởi Đầu Hành Trình Triệu Đơn",
        "Tư Duy Đúng Về Affiliate Marketing 2026",
        "TƯ DUY MINH TRIẾT",
        "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=800&q=80",
        `Chào mừng bạn đến với cẩm nang huấn luyện độc quyền hành động thực tế soạn bởi ${authorName}. Nhiều người bắt đầu làm Affiliate bằng việc đi spam liên kết khắp các hội nhóm, điều này hoàn toàn sai lầm. Bạn cần xây dựng một tệp khán giả trung thành quan tâm chân thực.`,
        "Sách slide này cam kết tương thích 100% giữa mục lục tổng và nội dung chi tiết của từng bước gãy gọn rành mạch. Hãy đọc và áp dụng từ trang đầu tiên đến trang cuối cùng.",
        "Bắt đầu bằng giá trị chia sẻ chân thực, hoa hồng tài chính tự khắc chảy về dồi dào.",
        ["Lập tài khoản chính ngạch TikTok Creator & Shopee Partner", "Bảo mật hai lớp cho hệ thống thanh toán cá nhân", "Xác định mục tiêu 10 đơn hàng đầu tiên trong tuần"]
      ),
      s(
        "2. Chọn Ngách Vàng (Niche Selection)",
        "Định Vị Chuyên Biệt Cho Kênh Sáng Tạo",
        "CHIẾN LƯỢC KÊNH",
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
        "Một cửa hàng tạp hóa hỗn loạn không bao giờ thu hút được khách hàng VIP. Bạn phải chọn một ngách duy nhất để thuật toán của mạng xã hội nhận diện chính xác tệp người nghe để phân phối video.",
        "Hãy sắm vai chuyên gia trong ngành hàng của bạn: Đồ gia dụng thông minh, Đồ chơi cho trẻ sơ sinh, hoặc Trị mụn tại nhà chuẩn Spa.",
        "Thấu hiểu 1 ngách hẹp tốt gấp 100 lần việc biết hời hợt muôn vàn ngành hàng xa lạ.",
        ["Xác minh ngách sản phẩm có hoa hồng tối thiểu 15%", "Chọn 3 đối thủ lớn trong ngách để phân tích phân khúc", "Viết bản mô tả kênh ngắn gọn định vị đúng thế mạnh chính mình"]
      ),
      s(
        "3. Săn Sản Phẩm Hot Trend Từ Gốc",
        "Đòn Đầu Xu Hướng Tiêu Dùng Nhanh Chóng",
        "NGHIÊN CỨU THỊ TRƯỜNG",
        "https://images.unsplash.com/photo-1542744094-3a31f103e35f?auto=format&fit=crop&w=800&q=80",
        "Cốt lõi của Affiliate là bắt được làn sóng nhu cầu mua sắm tức thời. Thường xuyên theo dõi bảng xếp hạng Shopee Analytics và TikTok Creator Center để rà tìm sản phẩm đang có doanh số bùng nổ.",
        "Sản phẩm xu hướng luôn đi kèm các hashtag khổng lồ giúp đẩy mồi lượt view tự nhiên cho video của bạn mà không tốn chi phí cho quảng cáo nặng nề.",
        "Đi theo dòng nước lũ luôn dễ dàng và nhanh chóng hơn việc chèo thuyền ngược dòng chảy.",
        ["Rà quét danh mục bán chạy nhất tuần trên trang quản lý Affiliate", "Kiểm tra số lượt mua tối thiểu từ 500+ lượt để đảm bảo sức hút", "Độ uy tín của shop đối tác phải đạt tối thiểu 4.8 sao vàng"]
      ),
      s(
        "4. Cơ Cấu Showcase Thôi Miên Bán Hàng",
        "Thiết Kế Cửa Hàng Ảo Tăng Chuyển Đổi",
        "TỐI ƯU GIAO DIỆN",
        "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
        "Trưng bày danh mục sản phẩm của bạn thật logic. Khách hàng lười nhác sẽ lập tức thoát ra nếu showcase của bạn lộn xộn, thiếu chỉ dẫn.",
        "Ghim 3 mặt hàng mồi (giá sâu dưới 50k, tặng quà trúng thưởng 0đ như ebook này) lên hàng đầu thu hút sự ghi nhớ cookie, tiếp đó là các combo bán chạy.",
        "Giao diện gọn gàng xóa bỏ rào cản phòng vệ tâm lý mua hàng cuối cùng.",
        ["Sắp xếp sản phẩm mồi nhận quà 0đ ở ngay vị trí trung tâm", "Cập nhật link dải băng thông tin rõ ràng khớp tên gọi sản phẩm", "Kiểm tra tính khả dụng của link thanh toán định kỳ"]
      ),
      s(
        "5. Bí Quyết Review Không Cần Mở Hộp",
        "Tận Dụng Nguồn Tài Nguyên Mở Miễn Phí",
        "TIẾT KIỆM CHI PHÍ",
        "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80",
        "Rất nhiều người ngần ngại làm affiliate vì sợ không có chi phí mua sản phẩm gốc về quay phim. Đừng lo lắng! Các nhãn phân phối luôn chuẩn bị sẵn dải video chất lượng không chữ cho đại lý biên tập.",
        "Sử dụng kỹ thuật lồng tiếng giọng nói thật độc bản, cắt ghép phối cảnh, lồng phụ đề để biến dải video nguồn thành nội dung riêng của kênh.",
        "Sự sáng tạo trong khâu biên tập và tư duy lồng tiếng giá trị hơn cả đạo cụ rườm rà.",
        ["Liên hệ shop xin kho video nguồn không nhãn mác", "Sử dụng thiết bị điện thoại thu âm lồng tiếng rõ ràng ấm áp", "Thêm hiệu ứng hoạt hình sinh động minh họa dễ hiểu"]
      ),
      s(
        "6. Kịch Bản Giữ Chân Khách 3 Giây Đầu",
        "Kỹ Thuật Móc Neo Tâm Lý (Hooking)",
        "VIẾT CONTENT",
        "https://images.unsplash.com/photo-1542744173-05336fcc7ad4?auto=format&fit=crop&w=800&q=80",
        "Khơi gợi trực tiếp nỗi đau và mong ước thầm kính của khách hàng ngay giây thứ nhất. Không chào hỏi dài dòng, không nói lời sáo rỗng kỳ quặc.",
        "Ví dụ: 'Dừng ngay việc dùng sữa rửa mặt này nếu không muốn da mỏng đi!' - câu thoại mang tính kéo giật sự chú ý lập tức bắt người xem nín thở.",
        "Chiến thắng ở 3 giây đầu tiên quyết định 90% sự thành bại của một chiến dịch video.",
        ["Lên danh sách 5 câu hook kích thích tò mò cao nhất", "Dùng font chữ tiêu đề lớn, màu sắc rực rỡ tương phản mạnh trên màn hình", "Lồng tiếng nhấn mạnh dứt khoát tăng âm lượng nhẹ ở đầu video"]
      ),
      s(
        "7. Chỉnh Sửa CapCut Chuyên Nghiệp Điện Thoại",
        "Tăng Nhịp Điệu Video Lôi Cuốn Tuyệt Đối",
        "KỸ THUẬT DỰNG HÌNH",
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
        "Nhịp điệu nhanh, dứt khoát ngăn cản người nghe lướt màn hình đi. Mỗi phân cảnh quay chỉ nên giữ từ 1.2 đến 2 giây rồi chuyển đổi góc nhìn.",
        "Chèn âm thanh xu hướng kích thích tâm lý hào hứng dưới nền với âm lượng nhỏ khoảng 5-8% để không lấn át tiếng nói bình luận của chính bạn.",
        "Sự chuyển động hình ảnh liên tục giữ nhãn cầu khách hàng gắn chặt vào video.",
        ["Kích hoạt tính năng phụ đề tự động trên ứng dụng CapCut", "Áp dụng zoom nhẹ khung hình để tạo chuyển động thị giác tinh tế", "Tăng tốc độ đọc tổng thể lên 1.1x rành mạch và nhanh gọn"]
      ),
      s(
        "8. Chiến Thuật 'Cứu Thu Hút 0đ' Nhận Quà",
        "Định Vị Ghi Đè Cookie Thụ Động Siêu Đẳng",
        "CHIẾN LƯỢC QUY ĐỔI",
        "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80",
        "Đây là bí kíp sống còn: Khi khách bấm vào đường dẫn link quà tặng miễn phí, thiết bị của họ sẽ lưu cookie chứa mã tiếp thị liên kết của bạn trong vòng vĩnh viễn 7-30 ngày tiếp theo.",
        "Mọi đơn hàng họ thanh toán trên Shopee, TikTok trong thời gian này đều đem hoa hồng dòng tiền chảy đều đặn về ví của bạn mặc kệ họ có mua món khác!",
        "Cho đi giá trị miễn phí dồi dào là nghệ thuật thu hút tài chính khôn ngoan nhất.",
        ["Tạo sẵn trích xuất link quà tặng ebook Slide-book giá trị này", "Nhắc nhở nhận quà 0đ liên tiếp ở cuối clip review", "Theo dõi dòng tiền hoa hồng gián tiếp phát sinh từ tệp khách nhận quà"]
      ),
      s(
        "9. Thuật Toán Phân Phối Đề Xuất TikTok Shop",
        "Nắm Bắt Quy Trình Đẩy Lượt Xem Tự Nhiên",
        "THUẬT TOÁN AI",
        "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=800&q=80",
        "Hệ thống AI đánh giá phân phối video dựa trên dải dữ liệu: Tỷ lệ xem hết video (Completion Rate), Lượt tương tác thả tim và chia sẻ.",
        "Chủ động kêu gọi khán giả để lại ý kiến bình luận bằng cách đặt các câu hỏi mở kích thích tranh luận văn minh dưới bài viết.",
        "Hiểu luật chơi của robot phân phối giúp bạn kiếm view không tốn một cước quảng cáo nào.",
        ["Đăng tải video sát giờ tan tầm (11h trưa, 7h tối)", "Trả lời nhanh toàn bộ bình luận đầu tiên xuất hiện", "Kiểm tra chỉ số giữ chân khán giả ở giây thứ 5 trên báo cáo phân tích"]
      ),
      s(
        "10. Copywriting Mê Hoặc Thuyết Phục Đơn",
        "Viết Caption PAS Đánh Trúng Tâm Lý Khách",
        "NGHỆ THUẬT NGÔN TỪ",
        "https://images.unsplash.com/photo-1542435503-956c469947f6?auto=format&fit=crop&w=800&q=80",
        "Câu chữ ngắn nhưng phải bén. Áp dụng cấu trúc viết mô tả PAS (Problem: Khơi đau - Agitate: Xoáy sâu - Solution: Giải quyết bằng sản phẩm liên kết).",
        "Tránh các từ ngữ phóng đại bị robot cấm đoán hoặc quét lỗi bản quyền thương mại để bảo toàn tài khoản an toàn tuyệt hảo.",
        "Mô tả sắc bén mở ví khách hàng trước cả khi họ chạm tay vào sản phẩm thực tế.",
        ["Đặt nỗi đau khách hàng ngay dòng đầu tiên của caption", "Chèn tối đa chỉ 3-5 hashtag chính ngạch sát sườn xu hướng", "Đặt câu kêu gọi hành động chuyển đổi rõ ràng, trực diện"]
      ),
      s(
        "11. Tạo Cộng Đồng Tương Tác Thụ Động Zalo/Fb",
        "Sở Hữu Tệp Khách Ruột Của Riêng Mình",
        "QUẢN TRỊ CỘNG ĐỒNG",
        "https://images.unsplash.com/photo-1557200134-90327ee9fafa?auto=format&fit=crop&w=800&q=80",
        "Khi sở hữu cộng đồng khách hàng trung thành, bạn không còn phụ thuộc 100% vào lượt xem xu hướng bấp bênh từ mạng xã hội nữa.",
        "Họ tin tưởng vị thế chuyên gia của bạn, liên tục hỏi xin link mua sắm hằng ngày để được bạn bảo hộ rà quét chất lượng hộ.",
        "Cộng đồng fan ruột là pháo đài bảo vệ tài sản số kiên cố của người làm Affiliate.",
        ["Lập link nhóm kín chia sẻ cẩm nang mồi giá trị hằng ngày", "Tổ chức quay thưởng bốc thăm miễn phí tri ân thành viên", "Tập hợp các link ưu đãi giảm giá sâu mỗi thứ 6 hằng tuần"]
      ),
      s(
        "12. Tăng Tốc Livestream Chốt Đơn Trực Tiếp",
        "Bùng Nổ Doanh Số Thời Gian Thực",
        "KỸ NĂNG LIVESTREAM",
        "https://images.unsplash.com/photo-1516280440614-37939bbacd6a?auto=format&fit=crop&w=800&q=80",
        "Video ngắn dẫn dắt thu hút, nhưng Livestream mới là cỗ máy vắt sữa doanh thu điên cuồng nhất nhờ yếu tố kích thích giới hạn thời gian thực tế.",
        "Sự hiện diện của bạn, cách cầm nắm sản phẩm, tương tác giọng nói trực tiếp củng cố niềm tin tuyệt đối thúc giục khách hàng nhấn mua ngay.",
        "Không khí dồn dập, đếm ngược trên live triệt tiêu hoàn toàn sự chần chừ do dự.",
        ["Chuẩn bị đầy đủ ánh sáng phòng live rõ nét chuyên nghiệp", "Soạn kịch bản chi tiết chia nhỏ quà cho từng mốc 15 phút phát sóng", "Phối hợp tung dồn dập dải voucher giảm sâu thu hút mắt nhìn"]
      ),
      s(
        "13. Phòng Ngừa Sập Kênh & Đợt Quét Phạt",
        "Quản Trị Rủi Ro Và Bảo Vệ Công Sức",
        "AN TOÀN PHÁP LÝ",
        "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
        "Chính sách cộng đồng thắt chặt gắt gao. Chỉ cần vi phạm các từ ngữ cấm kỵ vô ý là toàn bộ kênh hàng chục ngàn follow có thể bốc hơi vĩnh viễn.",
        "Tuyệt đối không lôi kéo khách hàng sang các sàn đối thủ trực diện trên live, không nói bậy bạ bỉ bôi, giữ phong thái lịch thiệp chuẩn mực chuyên nghiệp.",
        "Bảo vệ tài khoản an ninh là nền tảng cốt lõi để dòng thụ động luôn bền vững.",
        ["Đọc kỹ danh mục 150 từ cấm ngặt nghèo của chính sách sàn", "Nếu dính gậy, lập tức khiếu nại bằng văn bản minh bạch rõ ràng", "Luôn có phương án lập kênh phụ vệ tinh đồng hành song song"]
      ),
      s(
        "14. Ứng Dụng Độc Quyền Gemini AI Tăng Tốc",
        "Giải Phóng 90% Sức Sáng Tạo Kịch Bản Review",
        "CÔNG NGHỆ TƯƠNG LAI",
        "https://images.unsplash.com/photo-1531747118685-ca8fa6e08806?auto=format&fit=crop&w=800&q=80",
        "Đừng cặm cụi vắt óc suy nghĩ kịch bản lạc hậu nữa. Hãy ứng dụng Trợ lý Trí Tuệ Nhân Tạo Gemini AI tích hợp ngay trên Dashboard quản trị của chúng tôi.",
        "Chỉ cần nhấn nút tải ảnh sản phẩm, AI sẽ soạn thảo đầy đủ 3 kịch bản video ngắn cực chất kèm chỉ dẫn hành động chi tiết.",
        "AI không cướp việc của bạn, nhưng người biết dùng AI sẽ bỏ xa bạn ngàn dặm.",
        ["Soạn câu lệnh mô tả chi tiết cá tính kênh muốn hóa thân", "Sử dụng kịch bản AI xuất ra làm sườn và tự chỉnh sửa thực tế", "Dùng công cụ lọc từ ngữ bán hàng chuẩn mượt của AI"]
      ),
      s(
        "15. Bản Đồ Hành Động 21 Ngày Triệu Đơn",
        "Cam Kết Bền Bỉ Để Chạm Tay Tới Ước Mơ",
        "HÀNH ĐỘNG THỰC TẾ",
        "https://images.unsplash.com/photo-1552581230-c01591d6f557?auto=format&fit=crop&w=800&q=80",
        "Chúc mừng bạn đã đọc thấu triệt đến chương 15 tinh túy nhất của slide-book này. Kiến thức vĩ đại nhất vẫn chỉ là đống giấy lộn nếu bạn không chịu hành động dứt khoát hôm nay.",
        "Cam kết đều đặn tối thiểu 1 video/ngày liên tiếp trong 21 ngày đầu tiên để rèn giũa kỹ năng và dạy thuật toán robot nhận diện.",
        "Vạch xuất phát là hôm nay. Thành công nghìn đơn đang chờ đón dấu chân bứt phá của bạn!",
        ["Nhấn in tài liệu này để lưu trữ tra cứu trực tiếp đầu giường ngủ", "Tham gia hội hỗ trợ nhận cập nhật thông báo quà tặng VIP độc quyền", "Quay vòng quay may mắn rinh phần quà khởi nghiệp từ admin ngay"]
      )
    ];

      slides = [...slides, ...getExtraSlides('affiliate_guide', authorName)];
  } else if (topic === 'skincare_guide') {
    title = 'Cẩm Nang SkinCare Da Mụn Chuẩn Y Khoa Tại Nhà';
    category = 'Mỹ Phẩm';
    slides = [
      s(
        "1. Thấu Hiểu Cấu Trúc Làn Da Mụn",
        "Triệt Tiêu Nguồn Cội Gây Viêm Tại Nhà",
        "KIÊN THỨC CƠ BẢN",
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
        `Chào mừng bạn đến với Cẩm nang Chăm sóc Da Mụn chuẩn Y khoa 15 trang hành động bền bỉ biên soạn bởi chuyên gia ${authorName}. Mụn xuất phát từ sự bít tắc bã nhờn, tích tụ tế bào chết và sự bùng nổ của vi khuẩn C.acnes.`,
        "Sách slide này cam kết tương thích 100% giữa mục lục và nội dung chi tiết. Nắm rõ nguyên lý sẽ giúp bạn ngừng lãng phí hàng triệu đồng vào kem trộn độc hại.",
        "Trị liệu da mụn cần sự thấu hiểu bình thản, không phải sự nôn nóng cào cấu bộc phát.",
        ["Xác định chính xác loại da hiện tại của bạn (Dầu, khô, hỗn hợp)", "Từ bỏ hoàn toàn thói quen đưa tay sờ nắn cạy mụn lên mặt", "Dọn dẹp giặt sạch vỏ gối ngủ 2 lần hằng tuần"]
      ),
      s(
        "2. Phân Biệt Các Loại Mụn Thường Gặp",
        "Đích Danh Kẻ Thù Để Điều Trị Chuẩn Xác",
        "CHẨN ĐOÁN HỌC",
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        "Mụn ẩn, mụn đầu đen là mụn không viêm, cần tập trung đẩy nhân và làm sạch cổ nang lông. Trong khi đó mụn bọc, mụn mủ là mụn viêm nặng, cần tiêu diệt vi khuẩn và làm dịu kích ứng trước.",
        "Việc xử lý sai phương pháp giữa mụn viêm và không viêm sẽ lập tức tàn phá hàng rào bảo vệ, để lại sẹo rỗ vĩnh viễn.",
        "Trị sai cách biến mụn đầu đen nhỏ nhoi thành ổ viêm ăn sâu rỗ thịt sẹo.",
        ["Chụp ảnh chính diện góc tối để rà soát mật độ mụn ẩn", "Khoanh vùng các nốt mụn viêm sưng nóng đỏ cần chấm thuốc đặc trị", "Không dùng chung tăm bông chấm mụn viêm xoa sang vùng da lành"]
      ),
      s(
        "3. Sức Mạnh Làm Sạch Độ PH Vàng 5.5",
        "Bảo Vệ Acid Mantle Hàng Rào Sinh Học",
        "LÀM SẠCH CHUYÊN SÂU",
        "https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=800&q=80",
        "Nhiều người lầm tưởng sữa rửa mặt càng tạo nhiều bọt, rửa xong có cảm giác sạch bong kin kít thì càng tốt. Thực chất, chất tẩy rửa mạnh đã phá vỡ lớp màng axit tự nhiên pH 5.5 bảo vệ da.",
        "Mất đi màng bảo vệ, tuyến bã nhờn sẽ nhận tín hiệu báo động đỏ kích thích tiết nhiều dầu thừa hơn để bù đắp, gián tiếp tạo môi trường ấm cúng cho ổ vi khuẩn phát triển.",
        "Lấy sạch bụi bẩn nhưng phải tôn trọng tuyệt đối hàng rào dưỡng ẩm tự nhiên.",
        ["Chọn sữa rửa mặt dạng gel/sữa không bọt có độ pH từ 5.0 - 5.5", "Rửa mặt nhẹ nhàng bằng nước ấm vừa phải, tuyệt đối không chà xát mạnh", "Sử dụng bông lau mặt cotton dùng một lần thay vì khăn lau mặt ẩm mốc"]
      ),
      s(
        "4. Routine Ban Ngày Tối Giản",
        "Bốn Bước Bảo Vệ Da Trước Khói Bụi Đô Thị",
        "QUY TRÌNH BUỔI SÁNG",
        "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80",
        "Routine sáng tập trung tối đa vào bảo vệ da khỏi tia UV cực đoan và gốc tự do ô nhiễm. Khói bụi kết hợp với mồ hôi ban ngày rất dễ gây bí tắc.",
        "Một quy trình khuyên dùng bao gồm: Rửa mặt dịu nhẹ -> Nước cân bằng dịu da -> Tinh chất kháng viêm -> Kem chống nắng ráo mịn màng.",
        "Không bôi kem chống nắng bảo vệ kĩ càng thì mọi công dưỡng phục hồi ban đêm đều vô ích.",
        ["Rửa mặt bằng nước mát hoặc sữa rửa mặt nhẹ để làm sạch dầu thừa đêm qua", "Thoa toner cấp ẩm lỏng nhẹ không chứa cồn mốc", "Thoa kem chống nắng phổ rộng ráo mịn trước khi ra đường 15 phút"]
      ),
      s(
        "5. Routine Ban Đêm Tái Tạo Sâu",
        "Khôi Phục Tế Bào Thải Độc Độc Đáo",
        "QUY TRÌNH BUỔI TỐI",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
        "Ban đêm là thời gian vàng để phục hồi tế bào thương tổn và đẩy mụn ẩn. Da mụn bắt buộc phải trải qua bước tẩy trang làm sạch sâu trước.",
        "Trình tự buổi tối: Tẩy trang -> Rửa mặt sữa -> Tẩy tế bào chết hóa học -> Hoạt chất điều trị mụn -> Kem dưỡng phục hồi màng bảo vệ.",
        "Giấc ngủ sâu trước 23h kết hợp routine đêm đúng chuẩn đẩy nhanh chu trình tự chữa lành gấp đôi.",
        ["Luôn tẩy trang dù ngày hôm đó chỉ bôi kem chống nắng mỏng", "Chờ da khô tự nhiên hoàn toàn trước khi thoa các hoạt chất đặc trị acid", "Thoa kem phục hồi chứa B5 dập tắt cơn nóng rát châm chích"]
      ),
      s(
        "6. Hoạt Chất BHA (Salicylic Acid)",
        "Khắc Tinh Số Một Giải Phóng Bít Tắc",
        "HOẠT CHẤT ĐẶC TRỊ",
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        "BHA là acid gốc dầu, có khả năng đi xuyên qua lớp bã nhờn, thâm nhập sâu vào tận đáy lỗ chân lông để hòa tan lớp sừng chết bít tắc, dọn sạch ổ mụn ẩn dạt dào.",
        "Sử dụng nồng độ 2% từ 1-2 lần mỗi tuần để da làm quen, tránh hiện tượng kích ứng bùng viêm ồ ạt do lạm dụng liều lượng quá cao.",
        "BHA dọn dẹp sạch sẽ đường thông thoáng cho các hoạt chất tiếp theo hoạt động.",
        ["Dùng bông tẩy trang thấm lượng BHA vừa đủ thoa đều vùng chữ T", "Chờ da nghỉ ngơi 10 phút trước khi bôi serum cấp ẩm tiếp theo", "Tuyệt đối không dùng chung BHA cùng tối với hoạt chất Retinol mạnh"]
      ),
      s(
        "7. Niacinamide (Vitamin B3) - Ngôi Sao Sáng",
        "Kiểm Soát Nhờn Vàng Và Làm Mờ Thâm Sẹo",
        "HOẠT CHẤT HỒI PHỤC",
        "https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=800&q=80",
        "Niacinamide là hoạt chất dưỡng đa năng được giới da liễu sùng bái nhờ khả năng điều tiết tuyến dầu thừa, giảm mụn sưng đỏ và chặn đường đốm thâm đen melanocyte.",
        "Nên bắt đầu với nồng độ nhẹ nhàng 5% và tăng dần tới 10% khi hàng rào bảo vệ vững bền, mang lại nước da rạng ngời đều màu.",
        "Nước da mướt mịn tự sinh nhờ hoạt chất vàng tinh khiết bảo vệ màng sinh lọc.",
        ["Thoa tinh chất chứa Niacinamide sau bước toner cấp ẩm mượt", "Sử dụng đều đặn ngày hai lần sáng và tối bảo bọc tối hảo", "Kết hợp tốt cùng kẽm Zinc để kiểm soát viêm nhiễm mưng đỏ"]
      ),
      s(
        "8. Retinol Cách Bắt Đầu An Toàn Cho Da Mụn",
        "Tăng Tốc Sừng Hóa Tái Sinh Biểu Bì",
        "HOẠT CHẤT CHUYÊN SÂU",
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
        "Retinol là dẫn xuất thần kỳ của Vitamin A, kích thích tế bào sừng đào thải nhanh hơn, ngăn chặn bít tắc và khôi phục mờ sẹo rỗ hiệu quả lâu dài.",
        "Hãy dùng lượng nhỏ bằng hạt đậu đen với tần suất 1 lần/tuần kèm nguyên tắc kẹp kem dưỡng ẩm ẩm để tránh bong tróc da mỏng.",
        "Chìa khóa chống lão hóa trẻ hóa làn da nằm ở kỹ thuật dùng Retinol thông minh.",
        ["Thoa Retinol sau khi kem dưỡng khóa ẩm đã khô ráo hoàn toàn lớp đệm", "Chỉ bôi ban tối và bắt buộc thoa kem chống nắng thật kỹ sáng hôm sau lớp bảo vệ", "Tạm dừng sản phẩm khi có dấu hiệu bong rát nứt nẻ cực đoan"]
      ),
      s(
        "9. Chế Độ Dinh Dưỡng Cắt Cơn Bùng Mụn",
        "Giảm Thiểu Chỉ Số Insulin Kích Tiết Dầu",
        "DINH DƯỠNG TRỊ LIỆU",
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
        "Chế độ ăn nhiều đường, tinh bột tinh chế, các chế phẩm sữa bò làm chỉ số Insulin tăng vọt kích thích tuyến bã nhờn nổ bùng mọc mụn liên tiếp.",
        "Thay thế bằng chế độ ăn bổ sung chất béo tốt (Omega-3 từ cá hồi, hạt quả bơ), uống đủ nước lỏng sạch và bổ sung kẽm thực vật lành xanh.",
        "Tế bào của bạn chính là những gì bạn nạp qua khuôn miệng hằng ngày.",
        ["Cắt cơn thèm ngọt đường hóa học thay bằng trái cây ngọt thanh tươi tự nhiên", "Hạn chế tuyệt sữa tươi động vật chuyển sang sữa hạt nguyên kem", "Uống đủ tối thiểu hai lít nước lọc mỗi ngày hỗ trợ đào thải bã bẩn"]
      ),
      s(
        "10. Kem Chống Nắng Phổ Rộng - Giáp Bảo Vệ",
        "Chặn Đứng Tia Cực Tím Làm Thâm Mụn Sậm Màu",
        "GIÁP BẢO VỆ",
        "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80",
        "Không dùng kem chống nắng thì mọi công sức skincare trước đó đều vứt đi. Tia UV thiêu đốt làm màng da yếu ớt, kích hoạt vết thâm mụn ăn sẫm màu vĩnh viễn.",
        "Chọn dòng kem chống nắng phổ rộng ghi chỉ số SPF 50+, PA++++ mỏng nhẹ khô ráo không chứa thành phần gây bít tắc cồi nhân mụn.",
        "Bảo vệ da là phòng thủ kiên cố ngăn sẹo sạm màu hậu viêm quấy rầy.",
        ["Thoa lượng kem chống nắng đủ hai đốt ngón tay phủ đều cả khuôn mặt", "Dặm lại kem chống nắng sau mỗi 3-4 tiếng nếu hoạt động ngoài trời nóng mồ hôi", "Chọn chất kem ráo mịn kiềm dầu sữa mỏng nhẹ thông thoáng thông minh"]
      ),
      s(
        "11. Kem Dưỡng Phục Hồi Chứa B5 & Ceramide",
        "Hồi Sinh Lớp Bảo Vệ Sinh Học Mỏng Manh",
        "DƯỠNG PHỤC HỒI",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
        "Khi da đang dùng các hoạt chất đặc trị mạnh (BHA, Retinol), hàng rào bảo vệ tự nhiên bị tổn hao nghiêm trọng cần bồi đắp kịp thời bằng Panthenol (B5) và Ceramide gạch nối bảo bọc.",
        "Lớp kem dưỡng này sưởi ấm cấp nước làm dịu sưng đỏ nhanh chóng, dập tắt các ngọn lửa viêm da rực rát trong vòng hai mươi bốn giờ.",
        "Khóa ẩm đầy đủ giúp da bền bỉ dẻo dai bứt phá gốc tế bào thương mụn.",
        ["Thoa kem phục hồi mỏng nhẹ ở bước cuối cùng khóa chặt tinh chất tinh khiết", "Ưu tiên cấu trúc kem dạng gel-cream mát mướt thấm nhanh không gây bóng nhẫy", "Thoa dày hơn ở các vùng da đang bị khô rát sần bong tróc nứt nẻ"]
      ),
      s(
        "12. Phương Pháp Lấy Nhân Mụn Đúng Chuẩn",
        "Xử Lý Cồi Mụn Khi Đã Chín Muồi Tận Gốc",
        "KỸ THUẬT VỆ SINH",
        "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80",
        "Tuyệt đối không tự ý dùng tay dơ cạy nặn mụn khi nhân chưa chín. Việc này làm phá vỡ biểu bì, gây viêm lan rộng và dẫn đến sẹo lõm rỗ vĩnh viễn rất khó phục hồi sau này.",
        "Chỉ lấy nhân mụn khi đã gom cồi khô hoàn toàn bằng tăm sinh học kháng khuẩn vô trùng sạch sẽ, lau sạch mủ dại và bôi dung dịch giảm sưng viêm chuyên biệt ngay sau nặn tuyệt hảo.",
        "Lấy mụn đúng thời điểm và chuẩn vệ sinh là chìa khóa chặn đứng sẹo rỗ phức tạp.",
        ["Vệ sinh sạch tay và dụng cụ bằng cồn 70 độ trước khi nặn mụn", "Chỉ tác động lực nhẹ nhàng theo chiều vuông góc của nang lông khi nhân chín", "Bôi tinh chất phục hồi dịu nhẹ ngay sau khi nặn để tránh để lại sẹo thâm"]
      ),
      s(
        "13. Miếng Dân Mụn Kép Bảo Vệ Vết Thương Hở",
        "Cách Ly Ổ Viêm Khỏi Môi Trường Bụi Bẩn Đô Thị",
        "CHĂM SÓC TRỰC DIỆN",
        "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80",
        "Màng dán mụn hydrocolloid thông minh hoạt động như miếng đắp bảo vệ, hút dịch viêm còn sót lại ra ngoài êm ru dồi dào, rút ngắn hẳn thời gian sưng viêm.",
        "Đồng thời, nó ngăn chặn tuyệt đối thói quen vô thức đưa tay dơ sờ soạng lên nốt mụn hở rách vô cùng nguy hại.",
        "Cách ly đúng cách giúp vết thương lành nhanh gấp ba lần tự nhiên.",
        ["Lau khô vùng da mụn trước khi dán miếng dán mỏng tệp da", "Để miếng dán hút mủ dịch biến thành bọt trắng sữa dày từ 8-12 tiếng", "Thay mới định kỳ hằng ngày bảo đảm bảo bảo trị mụn sầm uất"]
      ),
      s(
        "14. Giấc Ngủ Vàng Cân Bằng Hormone Nội Tiết",
        "Tập Trung Giải Độc Tế Bào Thải Tuyến Nhờn",
        "SINH HỌC CHỮA LÀNH",
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=800&q=80",
        "Căng thẳng tinh thần, thức đêm quấy nhiễu nhịp sinh học kích hoạt tuyến thượng thận tăng bài tiết hormone Cortisol dồn dập, gián tiếp kích hoạt dầu thừa sưng mọc.",
        "Hãy thiết lập giấc ngủ trước 23h hằng tối, hít thở bụng sâu 10 phút sưởi ấm tinh thần tự phục hồi hệ miễn dịch rạng ngời dẻo dai khỏe khỏe.",
        "Một nội tiết tố cân bằng rạng ngời bắt đầu từ giấc ngủ ngon tĩnh tại sâu lắng.",
        ["Tắt màn hình điện thoại xanh trước giờ ngủ tối thiểu 30-45 phút", "Uống một ly nước ấm ấm dịu giọng hoặc trà hoa cúc tĩnh tâm dễ ngủ", "Duy trì phòng ngủ luôn tối mát thông thoáng không ẩm mốc bụi bặm"]
      ),
      s(
        "15. Về Đích Làn Da Láng Mịn Khỏe Đẹp Trọn Đời",
        "Trân Quý Nâng Niu Bản Thân Đẻ Luôn Tự Tin Rực Rỡ",
        "HÀNH TRÌNH TỎA SÁNG",
        "https://images.unsplash.com/photo-1608248597481-496100c80836?auto=format&fit=crop&w=800&q=80",
        `Chúc mừng bạn đã đọc thấu triệt 15 trang cẩm nang chăm sóc da mụn chuẩn y khoa do chuyên gia thiết lập của ${authorName}. Làn da là tấm gương trung thực nhất phản ánh phong thái yên ổn khỏe khoắn bên trong.`,
        "Kiên định thấu hiểu routine sinh lý da kết hợp dinh dưỡng lành tươi sẽ nâng bạn sang một tầm cao phong thái tự tin mới mướt mịn rạng rỡ bất chấp thời gian.",
        "Làn da khỏe đẹp rạng rời là quả ngọt phản hồi của lối sống kỷ luật và thương yêu chính mình.",
        ["In cẩm nang dán lên bàn trang điểm rà soát hàng ngày", "Chia sẻ cẩm nang rạng ngời cho người thương bản ruột", "Đặt lịch dưỡng phục hồi định kỳ ở những trung tâm spa y khoa tốt nhất"]
      )
    ];

      slides = [...slides, ...getExtraSlides('skincare_guide', authorName)];
  } else if (topic === 'nutrition_ebook') {
    title = 'Thực Dưỡng & Kế Hoạch Ăn Sạch Eat-Clean 14 Ngày';
    category = 'Sức Khỏe / Thải Độc';
    slides = [
      s(
        "1. Nguyên Lý Dinh Dưỡng Thực Dưỡng Hiện Đại",
        "Triết Lý Sống Xanh Cho Một Thân Thể Khỏe Mạnh",
        "TRIẾT LÝ DINH DƯỠNG",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        `Chào mừng bạn đến với cẩm nang thực dưỡng và kế hoạch ăn sạch Eat-Clean 15 trang hành động thực tế biên soạn bởi ${authorName}. Dinh dưỡng đóng vai trò gốc rễ nuôi lớn từng tế bào trong cơ thể chúng ta.`,
        "Ăn thô xanh, uống lành mạnh không chỉ nâng tầm vóc dáng mà còn là chiếc chìa khóa hồi sinh nội lực tinh thần an vui sâu thẳm hân hoan dồi dào giải độc.",
        "Thực phẩm chính là liều thuốc chữa lành tinh túy nhất của tự nhiên ban tặng.",
        ["Thực hành ăn sạch bằng cách giảm thiểu thức ăn chế biến sẵn chứa hóa chất", "Hiểu đúng về việc bổ sung năng lượng xanh cho cơ thể từ thực vật tươi sống", "Cam kết áp dụng 14 ngày bền bỉ để nhìn thấy sự thay đổi vượt bậc của cơ thể"]
      ),
      s(
        "2. Hiểu Về Calo In & Calo Out Chính Xác",
        "Sự Thật Về Việc Kiểm Soát Chỉ Số Năng Lượng",
        "NĂNG LƯỢC HỌC",
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
        "Một sai lầm nguy hại của người giảm cân ăn kiêng là nhịn đói bừa bãi làm cơ thể suy nhược thảm hại. Bạn cần ăn đủ lượng calo nền tảng TDEE để nuôi các cơ quan vận hành trơn tru.",
        "Thay thế mỡ xấu bão hòa bằng đạm thực vật sạch và carbohydrate phức tinh khiết giúp đốt cháy calo tự nhiên dạt dào, cơ săn chắc mịn màng.",
        "Ăn thông minh dồi dào dinh dưỡng thay vì bỏ đói vắt kiệt sức lực bảo bọc cơ thể.",
        ["Tính toán chỉ số năng lượng cơ bản cần thiết cho vận động hằng ngày", "Tập trung bổ sung các loại tinh bột hấp thu chậm giàu chất xơ", "Tránh uống các loại nước uống chứa calo rỗng chất tạo ngọt nhân tạo"]
      ),
      s(
        "3. Loại Bỏ Độc Tố Từ Thực Phẩm Công Nghiệp",
        "Thanh Lọc Hệ Tiêu Hóa Khỏi Phụ Gia Tác Hại",
        "VỆ SINH TIÊU HÓA",
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
        "Hóa chất tạo màu, tạo mùi, chất bảo quản và chất béo bão hòa trong các túi bánh mỳ hộp mỳ sườn ăn liền ẩn nấp phá hủy các vi nhung mao ở màng ruột âm thầm lâu năm.",
        "Tập trung thanh lọc độc tố tích lũy bằng cách chuyển dần sang nguồn nguyên liệu tươi ngon thuần khiết tự nhiên địa phương không chứa thuốc trừ sâu hóa học.",
        "Dọn dẹp độc tố định kỳ giải phóng áp lực làm việc nặng nề cho tế bào gan và mật.",
        ["Đọc kỹ dải nhãn phụ trên bao bì sản phẩm tránh xa chất bảo quản", "Sử dụng các loại củ gừng mộc t Garlic tỏi sả nghệ gia vị tự nhiên trong phòng nấu", "Thực hiện ngày nghỉ ăn thô xanh trọn vẹn nhẹ bụng mỗi tuần một lần an lành"]
      ),
      s(
        "4. Siêu Thực Phẩm Xanh (Superfoods)",
        "Đại Tiệc Diệp Lục Khôi Phục Tuần Hoàn Máu",
        "THẢI ĐỘC CHUYÊN SÂU",
        "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80",
        "Các loại rau xanh thẫm (cải xoăn Kale, bó xôi Spinach, tảo xoắn Spirulina) chứa lượng chlorophyll khổng lồ dạt dào tương đương cấu trúc hemoglobin trong hồng cầu giúp lọc sạch và tăng lượng máu tươi dồi dào nuôi cơ thể.",
        "Chúng mang dải chất chống oxy hóa cực mạnh tiêu diệt tế bào mầm mống gây lão hóa và dập tắt các ổ viêm ngầm tích tụ sâu trong cơ thể.",
        "Màu xanh diệp lục là sinh khí chữa lành quý giá của mẹ thiên nhiên ban tặng cho dòng máu.",
        ["Dùng sinh tố rau xanh pha tảo xoắn mỗi sáng thanh lọc dạ dày rỗng", "Nhai kỹ rau thô sống để tận dụng trọn vẹn enzyme sống thanh khiết", "Hạn chế đun rau xanh quá nhừ làm gãy nát dải vitamin quý giá dưỡng chất"]
      ),
      s(
        "5. Sát Thủ Âm Thầm Mang Tên Đường Tinh Luyện",
        "Chặn Độc Chất Gây Viêm Và Đẩy Nhanh Lão Hóa",
        "CẢNH BÁO SỨC KHỎE",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
        "Đường cát trắng tinh luyện ngọt lịm thực chất là 'calo rỗng' độc hại gây độc tế bào, tạo ra lượng lớn sản phẩm AGEs tàn phá dải collagen làm da chùng xệ nhăn nheo già nua thê thảm.",
        "Nó cũng kích hoạt dải phản ứng viêm toàn thân, gây suy giảm hệ miễn dịch trầm trọng tạo môi trường ấm cúng nuôi u mục mưng mủ.",
        "Cai nghiện đường ngọt nhân tạo là bước đi sống còn để khôi phục tuổi xuân dẻo dai.",
        ["Thay thế toàn bộ đường kính trong bếp bằng mật ong rừng hoang dã dạt dào", "Nói không với các dải nước ngọt đóng chai, trà sữa ngọt đập nát lục phủ ngũ tạng", "Đọc kỹ thành phần tránh xa đường mía tinh chế chất bảo quản ẩn nấp"]
      ),
      s(
        "6. Chất Béo Tốt Hồi Sinh Hệ Thần Kinh Não Bộ",
        "Bôi Trơn Khớp Xương Tràn Sinh Khí Tươi Trẻ",
        "CHẤT BÉO THỰC DƯỠNG",
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
        "Màng bọc myelin của tế bào thần kinh cấu thành từ lipid chất lượng cao. Việc kiêng khem chất béo cực đoan làm giảm sút trí nhớ mốc meo, uể oải tinh thần mông lung lú lẫn.",
        "Nạp dồi dào chất béo chưa bão hòa từ quả bơ tươi, dầu oliu nguyên chất ép lạnh extra virgin, hạt macca óc chó hạnh nhân bùi ngậy bôi trơn nhịp tim dẻo dai thông tuệ dạt dào của bạn.",
        "Chất béo tốt là nhiên liệu cao cấp sưởi ấm bộ não và điều hòa nội tiết tố nữ rạng rực.",
        ["Tuyệt đối không đun nóng dầu oliu ở nhiệt độ cao gây biến tính độc", "Bổ sung dải chất Omega-3 nhuyễn thể cá hồi đại dương tăng tuần hoàn", "Ăn góc tư quả bơ tươi mỗi buổi chiều lót dạ nạp béo lành"]
      ),
      s(
        "7. Thực Hành Uống Nước Đúng Cách Chữa Lành",
        "Giải Độc Thận Bàng Quang Khơi Thông Nguồn Sống",
        "NƯỚC NGUỒN CHỮA LÀNH",
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
        "Uống nước dồn dập một lúc sẽ làm loãng điện giải cơ thể, thận quá tải dội ngược tạo mỏi khớp đau hông thảm hại hụt hơi.",
        "Quy trình đúng là uống từng ngụm nhỏ, giữ lại khoang miệng bậm môi gom kích hoạt enzyme kiềm thô dồi dào rồi nuốt xuống êm đềm.",
        "Nước sạch đi từng ngụm rưới tưới mầm sống căng tràn mượt tế bào tươi mở.",
        ["Uống ngay một ly nước ấm 300ml ngay sau khi thức dậy làm sạch khoang ruột", "Uống rải đều trong ngày, ngưng nạp nước lạnh đá buốt co thắt dạ dày dầy", "Bổ sung vài hạt muối biển thô trong cốc nước tăng khoáng hoạt tính tự nhiên"]
      ),
      s(
        "8. Bữa Ăn Thô Salad Eatclean Chuẩn Spa",
        "Tận Dụng Trọn Vẹn Enzyme Sống Chống Lão Hóa",
        "CÔNG THỨC EATCLEAN",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        "Nhiệt độ đun nấu cao phá hủy hầu hết enzyme sống - 'chìa khóa của sự sống' giúp phân cắt trao đổi chất năng động. Hãy dành tối thiểu 30-50% bữa ăn là thô mộc xanh sạch.",
        "Đĩa salad phối màu ngũ sắc sặc sỡ bồ bồi nhiều đạm thực vật chất lượng, rưới xốt mè chanh dừa béo bùi rạng rỡ thơm nức.",
        "Enzyme thô từ rau củ tươi sưởi ấm trẻ hóa cơ thể toàn diện sâu sắc.",
        ["Sơ chế rửa sạch ngâm nước muối loãng xoa dịu bụi bẩn bọ gờ", "Phối trộn rau mầm cải đỏ non, bơ, hạt điều rắc nhẹ vừng mè bùi ngậy", "Ăn bữa thô nhẹ bụng vào bữa tối giảm tải triệt để tiêu hóa đêm ngủ"]
      ),
      s(
        "9. Bộ Não Thứ Hai - Hệ Vi Sinh Đường Ruột",
        "Cân Bằng Probiotics Kiến Tạo Sức Đề Kháng",
        "HỆ TIÊU HÓA CUỘC SỐNG",
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
        "90% lượng hormone hạnh phúc Serotonin cấu tạo dồi dào từ chính màng ruột non bộc lộ chất lượng do tệp lợi khuẩn probiotics chi phối gắt gao.",
        "Hệ đường ruột sạch, giàu chất xơ hòa tan prebiotics (từ chuối chín, yến mạch, tỏi tây) chặn đứng 80% nguy cơ mọc mụn nhọt độc viêm sưng sưng lở lở nội tâm.",
        "Đường ruột sạch tinh khiết mang lại vẻ rực rỡ láng mịn của làn da bên ngoài.",
        ["Bổ sung một hũ sữa chua ít đường mộc mạc hằng tối sau ăn nhẹ hai giờ", "Uống nước dấm táo pha loãng mật ong cân bằng tốt độ axit dạ dày", "Cắt đứt toàn bộ dải thuốc kháng sinh tự ý lạm dụng bừa bãi tàn gốc khuẩn"]
      ),
      s(
        "10. Triệu Chứng Thải Độc Đáng Yêu (Detox Healing Crisis)",
        "Dấu Hiệu Cơ Thể Đang Tự Chữa Lành Rực Rỡ",
        "LƯU Ý QUAN TRỌNG",
        "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80",
        "Khi mới chuyển đổi ăn sạch, cơ thể dọn rác sẽ đào thải độc tố ra máu gây nhức mỏi cơ đầu, mụn đẩy rần nốt li ti, đi ngoài sục sạo thô rác khó ngửi.",
        "Đừng lo lắng từ bỏ sập cửa! Đó là quá trình 'Healing Crisis' đáng mừng chứng tỏ cơ thể bạn đang trút bỏ thành công đống rác hôi lâu năm.",
        "Bình thản đón nhận cơn khủng hoảng phục hồi để chạm ngưỡng giải thoát cơ thể sạch.",
        ["Uống nhiều nước ấm gừng mật dập tắt nhức đầu vặt mỏi sườn mỏi gối", "Xông mặt lá tía tô tràm trà kháng viêm đẩy cặn mủ mụn thông thoáng", "Không dùng thuốc giảm đau ức chế quá trình đào thải tự nhiên hữu ích"]
      ),
      s(
        "11. Nghệ Thuật Chế Biến Gia Vị Tự Nhiên Chữa Lành",
        "Thay Thế Muối Đường Hóa Học Bằng Tinh Túy Đất",
        "GIA VỊ SỰ SỐNG",
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
        "Bột ngọt siêu ngọt hóa chất gây kích thích neuron thần kinh quá đà, làm tích dịch thũng phù giữ nước húp híp sưng béo giả béo phị.",
        "Ứng dụng muối hồng Himalaya nguyên thô dạt dào khoáng vi lượng chất lượng, bột nghệ vàng dập tắt ổ viêm sưng tấy mọc loang và tiêu dịch ứ vô lý.",
        "Gia vị tinh khiết thắp sáng tinh thần sảng khoái sau mỗi bữa ăn mộc lành.",
        ["Thay chai muối trắng gia đình bằng hũ muối hồng thô sần sùi dạt dào vi lượng", "Nấu nước dùng ngọt từ củ cải, hành tây, ngô ngọt thay thế xương ống mỡ tủ", "Sử dụng bột nghệ vàng kháng viêm tự nhiên dồi dào dập sưng nội bộ"]
      ),
      s(
        "12. Tự Làm Các Loại Sữa Hạt Tinh Khiết Tại Nhà",
        "Nguồn Đạm Thực Vật Thủy Phân Lành Mạnh Dễ Tiêu",
        "CÔNG THỨC THỦ TRỢ",
        "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=800&q=80",
        "Sữa bò có chứa đường lactose khó dung hòa gây dị ứng đẩy mụn bọc sưng sần nổi tưng tơ và gây viêm đại tràng khó chịu lâu ngày.",
        "Tự làm sữa hạt hạnh nhân, sữa đậu nành hạt sen bằng máy xay nấu gia đình. Uống ly sữa nóng ấm bốc hương thơm lành sưởi ấm dạ dày buổi sáng thật thảnh thơi dạt dào.",
        "Sữa từ cây cỏ chứa sinh lực đất trời ngọt ngào che chở niêm mạc ruột non dạt dào.",
        ["Ngâm hạt hạnh nhân lột nhẹ vỏ lụa làm trắng mịn thanh mảnh sữa", "Nấu sữa cùng hạt sen bùi béo an thần dưỡng óc ngủ sâu ngủ ngon", "Dùng ngay trong vòng 24h bảo quản tủ mát không chất chống thiu"]
      ),
      s(
        "13. Thiết Lập Nhịp Sinh Học Detox 16:8 Thường Niên",
        "Phương Pháp Nhịn Ăn Gián Đoạn Autophagy Kích Hoạt",
        "PHƯƠNG PHÁP NHỊN ĂN",
        "https://images.unsplash.com/photo-1505576399279-565b52d4ac71?auto=format&fit=crop&w=800&q=80",
        "Khi nhịn ăn liên tục 16 tiếng (Ví dụ ăn tối lúc 19h và nhịn tới 11h trưa hôm sau), cơ thể cạn glycogen sẽ kích hoạt dải cơ chế Autophagy (Tự thực bào).",
        "Lúc này, các đại thực bào thông thái sẽ rà lùng tiêu diệt toàn bộ mảng xơ sẹo hỏng, tế bào mầm ung thư, mỡ thừa tích tụ để làm năng lượng thay thế sạch.",
        "Dọn dẹp rác thải nội tạng nhờ liệu pháp bỏ đói thông minh định kỳ tuyệt hảo.",
        ["Ăn bữa chiều tối nhẹ nhàng vừa phải rồi thắt khóa khẩu vị lúc 19h tối", "Sáng hôm sau chỉ uống nước ấm lỏng lọc hoặc trà xanh dập đói nhẹ nhàng", "Ăn xả bữa trưa đầu tuần bằng đĩa rau thô salad nhiều đạm thực vật thực dưỡng"]
      ),
      s(
        "14. Giải Mã Nguy Cơ Từ Thực Phẩm Đột Biến Gen GMO",
        "Lựa Chọn Nguồn Giống Thuần Chủng Để Bảo Vệ",
        "CON ĐƯỜNG TIÊU DÙNG",
        "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80",
        "Các loại ngô, đậu nành biến đổi gen GMO chứa dải hóa chất diệt cỏ Glyphosate lưu ngấm lâu ngày tàn hại nội màng tử cung, tinh trùng teo yếu.",
        "Hãy ưu tiên tuyệt đối các dải đậu đỗ giống thuần chủng Việt Nam hạt nhỏ, sâu tự nhiên nhè nhẹ nhưng bùi thơm tràn dải năng lượng gốc nguyên bản vô cùng bồi bổ.",
        "Tôn kính gen di truyền nguyên bản của tự nhiên để bảo vệ sức khỏe giống nòi rực rỡ.",
        ["Tìm kiếm nhãn dán Non-GMO uy tín khi chọn lựa các hạt ngoại nhập", "Bảo tồn dạt dào các giống cây cổ truyền thuần chủng vườn nhà ông bà xưa", "Không ham hố hoa quả khổng lồ bóng loáng sáp ngọt mất tự nhiên"]
      ),
      s(
        "15. Thực Đơn Kiểu Mẫu 14 Ngày Eatclean Thượng Hạng",
        "Bản Đồ Chỉ Đường Cho Sức Khỏe Vàng Mãi Mãi",
        "BIẾN ĐỔI CHỦ ĐỘNG",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80",
        `Chào mừng bạn đã đi trọn dải 15 trang cẩm nang thực dưỡng thông thái bồi bổ cơ thể của ${authorName}. Một sức khỏe dẻo dai căng mướt tràn sinh khí không bao giờ có được nhờ các liều thuốc giảm triệu chứng ăn xổi.`,
        "Đó là thành quả của lối sống yêu thương bản thân sâu sắc, lắng nghe nhu cầu tế bào hằng ngày hằng giờ.",
        "Thân khỏe thì tâm tự khắc an yên lâu bền. Hãy gieo mầm hạt giống sức khỏe lành tươi hôm nay ngay thôi!",
        ["Nhấn in PDF dán ngay lên cửa hông tủ lạnh nhà bếp nhắc nhở hằng ngày", "Chia sẻ cẩm nang này cho những người thân yêu ruột thịt cùng thực hành", "Quay thưởng bốc thăm rinh dạt dào thêm quà tặng sức khỏe lành mạnh tự nhiên"]
      )
    ];

      slides = [...slides, ...getExtraSlides('nutrition_ebook', authorName)];
  } else if (topic === 'fashion_tips') {
    title = 'Bí Truyền Phối Đồ Thời Trang Đón Đầu Xu Hướng 2026';
    category = 'Thời Trang Nữ';
    slides = [
      s(
        "1. Tuyên Ngôn Phong Cách Cá Nhân",
        "Bản Sắc Độc Bản Không Lẫn Vào Đám Đông",
        "PHONG CÁCH SỐNG",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
        `Chào mừng bạn đến với Cẩm nang Phối Đồ Thời Trang Đón Đầu Xu Hướng 15 trang hành động do Fashionista ${authorName} biên soạn độc quyền. Thời trang là ngôn ngữ trực quan phản ánh cái tôi tinh khiết của bạn trước khi bạn cất lời nói.`,
        "Sách tương thích 100% rành mạch giữa mục lục và nội dung này cam kết nâng cấp hoàn toàn tư duy thẩm mỹ ăn mặc phối màu rạng ngời của bạn bất chấp tuổi tác sầm uất xinh tươi.",
        "Thời trang thay đổi liên tục, nhưng phong cách độc bản mới là thứ trường tồn vĩnh cửu dựng phom.",
        ["Xác định 3 tính từ đại diện cho cá tính ăn mặc bạn muốn hướng tới", "Loại bỏ hoàn toàn các dải quần áo cũ rách, sờn chỉ không còn vừa vặn", "Học cách trân trọng nâng niu vóc dáng cơ thể tự nhiên vốn có của bạn rạng rỡ"]
      ),
      s(
        "2. Trào Lưu Quiet Luxury (Sang Trọng Thầm Lặng)",
        "Đỉnh Cao Độc Bản Tôn Vinh Vật Liệu Hạng Sang",
        "XU HƯỚNG THỜI THƯỢNG",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
        "Trào lưu Quiet Luxury ngự trị ngai vàng năm nay đề cao dải ăn mặc không có bóng dáng logo to bản lòe loẹt khoe khoang của nhãn hiệu đắt đỏ sấn sổ thô thiển bồng bột.",
        "Sự quý phái bộc lộ tinh khiết qua chất liệu gấm dệt, linen mộc mạc, satin thượng hạng ráo tay và các đường chỉ xẻ tà thủ công tinh tế bậc thầy mang hào quang nhẹ.",
        "Thì thầm nhỏ nhẹ nhưng có sức lay động hàng vạn ánh nhìn vì sự sang quý lịch thiệp sâu sắc.",
        ["Chọn tông màu trung tính ấm áp làm chủ đạo (beige, trắng sữa, nâu gụ)", "Đầu tư vào một chiếc áo khoác Blazer chuẩn form may đo thủ công rành mạch", "Tránh xa các họa tiết in phun nylon mỏng dính dễ bong tróc quê kiểng mỏng mảnh"]
      ),
      s(
        "3. Nhận Biết Và Định Định Hình Dáng Người Cơ Thể",
        "Tôn Vinh Ưu Điểm Và Thu Nhỏ Nhược Điểm Thị Giác",
        "THẨM MỸ HỌC",
        "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?auto=format&fit=crop&w=800&q=80",
        "Mỗi dáng người (Đồng hồ cát quyến rũ, Quả lê đùi hông nở, Tam giác ngược vai rộng) có những quy tắc bù trừ tỷ lệ thị giác nghiêm ngặt khác biệt lớn bắt buộc phải thấu tỏ rõ ràng.",
        "Ví dụ cô nàng dáng quả lê nên tập trung phối các chi tiết bèo dún, rèm tà ở thân trên áo để kéo cân bằng đối trọng hông đùi thanh thoát gọn gàng.",
        "Không có vóc dáng xấu, chỉ có bộ trang phục không biết bù trừ tỷ lệ thị giác cho chủ nhân.",
        ["Dùng thước dây đo chính xác dải số đo vai, ngực, eo, mông của chính bạn", "Vẽ sơ đồ tỷ lệ dáng người của chính mình ra giấy nháp định vị phom dáng", "Lựa chọn phom váy xòe chữ A che giấu đùi hông lớn thông minh rành mạch"]
      ),
      s(
        "4. Thuyết Ba Màu Đồng Điệu Kinh Điển",
        "Kỹ Thuật Phối Màu Sắc Hài Hòa Không Rối Mắt",
        "KỸ NĂNG PHỐI MÀU",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
        "Một lỗi sai vô cùng thảm họa thị giác là diện quá nhiều khối màu tương phản lòe loẹt chói chang trên cùng một bộ trang phục (lớn hơn 3 màu chọi nhau chen chúc).",
        "Quy tắc vàng 60-30-10: 60% cho màu sắc chủ đạo nền nã gạt gỡ, 30% cho sắc thái định phom bổ trợ, và duy nhất 10% dành cho gam màu rực nhấn nhá phụ kiện kẹp nơ dồi dào hào quang.",
        "Sự phân bổ sắc độ thông minh tạo dải cân bằng mát mắt rạng ngời thời thượng.",
        ["Ghép cặp sắc độ ấm với ấm hoặc mát mẻ với mát lạnh đồng đều hài hòa", "Lấy chiếc túi xách hoặc thắt lưng làm dải màu 10% điểm nhấn rực sáng tinh tế", "Sử dụng bánh xe màu sắc để rà soát các cặp màu tương sinh bổ trợ tốt"]
      ),
      s(
        "5. Xây Dựng Tủ Quần Áo Capsule Wardrobe 15 Món",
        "Biến Hóa Thần Kỳ Tạo Nên 50 Outfit Ấn Tượng Rạng Rỡ",
        "TIẾT KIỆM TỐI GIẢN",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
        "Sở hữu hàng trăm món quần áo nhưng mỗi sáng vẫn loay hoay khóc lóc thốt lên không có gì để mặc! Đó là do bạn thiếu dải sản phẩm basic dễ ghép phối.",
        "Lập ngay tủ đồ 15 món chất lượng cao vượt thời gian: Áo thun trắng mịn, sơ mi oversized lụa, quần tây cạp cao, váy lụa đen và blazer beige rạng ngời.",
        "Tối giản số lượng, tối đa hóa dải chất lượng kết cấu kết hợp linh hoạt.",
        ["Chặn cơn mua quần áo theo hot trend rẻ tiền bốc đồng nhanh mốc hỏng", "Mỗi món mua mới phải chắc chắn phối được tối thiểu 3 kiểu thời trang sẵn có", "Ưu tiên đầu tư dải chất liệu organic bền bỉ không giãn phai màu"]
      ),
      s(
        "6. Quần Jeans Cạp Cao - Siêu Nhân Hack Chiều Cao",
        "Định Vị Vòng Eo Ảo Cho Cô Nàng Chân Ngắn",
        "KỸ THUẬT HACK DÁNG",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
        "Quần cạp trễ kéo hông xệ làm đôi chân trông ngắn tũn thảm hại dã man sần xấu. Hãy trung thành với các thiết kế quần Jeans, Kaki cạp cao chạm rốn.",
        "Nó dồn dải eo lên cao dạt dào, tạo hiệu ứng thị giác chân dài tít tắp sành điệu, giấu nhẹm mỡ bụng dưới thông minh rành mạch thanh tú lộng lẫy.",
        "Chiêu kéo dài chân huyền thoại ai áp dụng cũng sầm uất vẻ tôn quý và thời trang.",
        ["Chọn dáng quần ống suông đứng, phom đứng dày dặn tự nhiên rạng dỡ", "Phối sơ vin đóng thùng nửa vạt hờ hững thời trang tinh nghịch phong cách", "Mang kèm một đôi giày mũi nhọn đồng màu quần để kéo dài tối đa tầm nhìn"]
      ),
      s(
        "7. Nghệ Thuật Phối Đồ Nhiều Lớp (Layering Style)",
        "Tạo Chiều Sâu Và Sự Uyển Chuyển Cho Trang Phục",
        "TẠO ĐIỂM NHẤT TRANG PHỤC",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
        "Phối layering không có nghĩa là nhồi nhét mặc hàng tá quần áo lên người như con gấu sực nức mùa đông nóng bức bí bách khó chuyển dịch dạt dào mồ hôi.",
        "Đó là sự xen kẽ gãy gọn của các lớp: thun mỏng lót trong thấm hút mồ hôi, sơ mi lanh rủ rượi khoác ngoài bay lượn và blazer phom đứng sấn sấn cá tính.",
        "Trò chơi của dải kết cấu chuyển động mỏng dày, dài ngắn mềm mại uyển chuyển.",
        ["Lớp vải tiếp xúc trực diện da phải tuyệt mềm mại thấm mồ hôi tối hảo", "Giữ tỷ lệ dải chiều dài lớp ngoài dài hơn lớp bên trong hoặc ngược lại", "Mở bung vạt cúc áo khoác ngoài tạo khoảng hở tạo cá tính mạnh quý cô"]
      ),
      s(
        "8. Sự Thần Kỳ Của Bộ Trang Sức Phụ Kiện Mạ Vàng",
        "Điểm Chạm Tinh Tế Thổi Hồn Cho Sét Đồ Đơn Sắc",
        "TRANG SỨC ĐỘC ĐÁO",
        "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?auto=format&fit=crop&w=800&q=80",
        "Một bộ đồ đơn sắc trơn tru tẻ nhạt sẽ lập tức biến hình thành diện mạo hào quang thu hút lấp lánh sang quý nhờ sự điểm xuyết của phụ kiện mạ vàng tinh gọn rành rành.",
        "Dây chuyền xích mảnh xếp lớp dài ngắn (layering necklaces), khuyên tai vòng tròn rực rỡ thu gọn góc cạnh xương gò má sáng khuôn mặt thanh tú thời trang.",
        "Phụ kiện là nốt nhạc ngân nga kết thúc bản hòa tấu thời trang sành điệu kiêu hãnh.",
        ["Tuyệt đối không mang cả đống lắc xích vòng vèo hầm hố cồng kềnh", "Dùng dải phụ kiện mạ vàng ấm áp cho da tông màu ấm và mạ bạc cho da mát lạnh", "Bảo quản lau chùi phụ kiện tránh bị xỉn màu mốc ố đen đúa sần sùi sần xấu"]
      ),
      s(
        "9. Bí Quyết Phối Đồ Monochromatic Nhã Nhặn",
        "Quyền Lực Từ Sự Đồng Bộ Đơn Sắc Sang Trọng",
        "MÀU SẮC ĐỒNG BỘ",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
        "Diện cả một cây đồ đơn sắc (ví dụ trắng kem, nâu nhạt, xanh rêu) là bí thuật hack dải dáng mảnh khảnh cao ráo bậc nhất của giới mộ điệu sành ăn mặc sầm uất rực sáng.",
        "Để phong cách này không bị tẻ nhạt đơn điệu, hãy linh hoạt phối trộn các kết cấu vật liệu đối nghịch: Áo len đan xốp xù lông mix váy lụa satin chảy rũ mát rượi.",
        "Đồng màu sắc đơn điệu nhưng biến tấu dạt dào dải kết cấu khác biệt sâu sắc.",
        ["Chọn tông màu pastel nhã nhặn dịu nhẹ cho ban ngày thảnh thơi thảnh", "Kèm theo thắt lưng da bò tối màu chia tách nhẹ điểm eo ảo mượt mà", "Giày và túi xách đi kèm bám sát quanh nấc đậm nhạt của cây màu chủ đạo tốt"]
      ),
      s(
        "10. Chọn Giày Chuẩn Điệu Cho Từng Phom Váy",
        "Nâng Đỡ Bước Chân Thanh Thoát Dáng Đi Quyến Rũ",
        "CHỌN GIÀY PHÙ HỢP",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
        "Một chiếc váy Midi thướt tha rủ dài sẽ bị giết chết thẩm mỹ vô lý nếu bạn phối cùng một đôi giày bánh mì đế xuồng thô kệch nặng như đá tảng sần sùi quê mỏng.",
        "Ưu tiên phối váy midi bay rủ cùng boots cao cổ gót nhọn thanh mảnh, váy chữ A ngắn với giày búp bê Mary Janes cổ điển dịu nhẹ nữ tính ngọt lịm tôn quý ráo mịn.",
        "Giày tốt dẫn lối bạn tới những chân trời sầm uất xinh đẹp lộng lẫy nhất cuộc sống.",
        ["Dọn dẹp sắm sẵn đôi cao gót mũi nhọn màu nude tệp da rạng ngời tôn chân", "Kiểm tra độ êm chống trượt của gót giày tránh trầy xước gót hồng chân mộc", "Tối giản màu sắc giày bám quanh ba gam cơ bản đen, trắng sữa, beige"]
      ),
      s(
        "11. Chất Liệu Đũi Linen - Hơi Thở Của Thiên Nhiên",
        "Ăn Mặc Thả Lỏng Sang Xịn Mịn Giữa Mùa Hè Việt Nam",
        "VẬT LIỆU THÂN THIỆN",
        "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80",
        "Linen dệt từ sợi lanh tự nhiên mộc mạc, thấm hút mồ hôi xuất sắc cực độ, mang vẻ đẹp phóng khoáng, hoang dã tự do, đậm hơi thở nghỉ dưỡng cao quý sành mặc.",
        "Sự nhăn nheo nhẹ nhàng của linen không hề bê bối nhếch nhác. Đó là nét đặc trưng thể hiện sự thả lỏng thư thái của giới trung lưu thượng lưu an nhàn tự tại.",
        "Khoác linen thô mịn lên mình lắng nghe giai điệu thiên nhiên mơn man làn da dịu ngọt.",
        ["Ưu tiên mua đồ linen cao cấp dệt sợi dày dặn tránh lộ nội y bên trong mỏng", "Ủi ẩm bằng bàn là hơi nước trước khi mặc lật nếp tà đứng phom nhè nhẹ", "Phối linen cùng các túi mây đan mộc mạc chuẩn vibe nàng thơ nghỉ mát rạng"]
      ),
      s(
        "12. Biển Đổi Linh Hoạt Outfit Công Sở Đi Tiệc Tối",
        "Sẵn Sàng Tỏa Sáng Ở Mọi Khung Giờ Hoạt Động",
        "LINH HOẠT CUỘC SỐNG",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=800&q=80",
        "Bạn không có thời gian chạy về nhà thay đồ dự tiệc sau giờ tan sở bận rộn? Hãy mặc sẵn một chiếc váy lụa đen Slip Dress quyến rũ lót trong bảnh bao.",
        "Ban ngày khoác ngoài chiếc Blazer phom lịch sự đóng cấn cúc chỉn chu. Tối đến cởi bỏ blazer, dặm chút son đỏ đậm đỏ mọng lấp lánh dạt dào ánh sao quý cô quyến rũ.",
        "Biến hóa thần kỳ chỉ trong nháy mắt thể hiện trí tuệ phối đồ đỉnh cao nhạy bén dồi dào.",
        ["Bỏ sẵn thắt lưng bản to, khuyên tai lấp lánh trong túi xách sơ cua hằng ngày", "Thay đôi giày bệt công sở bằng gót nhọn kiêu kỳ 7 phân lộng lẫy quý phái", "Thương xức một chút nước hoa mùi gỗ sâu ấm áp bí ẩn cho một đêm tiệc rực rỡ"]
      ),
      s(
        "13. Bí Thuật Giấu Mỡ Bụng Sau Váy Lụa Chảy Rủ",
        "Trị Triệt Để Sự Bất Cập Của Vải Phi Satin Bóng",
        "GIẢI QUYẾT BẤT CẬP",
        "https://images.unsplash.com/photo-1540221652346-e5dd6b50f3e7?auto=format&fit=crop&w=800&q=80",
        "Satin lụa bóng là chất liệu cực sang nhưng lại phản chủ dấn dơ phơi bày toàn bộ vết ngấn bụng tròn trịa thê lương gồ ghề của phái đẹp khi hoạt động gập mình.",
        "Mẹo nhỏ là chọn dải lụa dệt mờ (Matte Silk) có phom cắt xéo vải (bias cut) chảy ôm hông nhẹ nhàng nương theo dải lồi lõm eo lắt léo che giấu tự nhiên rạng ngời.",
        "Vải cắt xéo trượt nhẹ nhàng tạo độ gợn sóng che mờ hoàn toàn khuyết điểm mỡ thừa vô lý.",
        ["Luôn diện cùng quần sịp tàng hình không dải viền gờ dày cộm thô cứng", "Chọn cạp váy thiết kế thêu thắt nhẹ che giấu vùng rốn phẳng phiu", "Tự tin thẳng lưng ưỡn ngực tạo dòng s-line visual quyến rũ tự nhiên thanh tú"]
      ),
      s(
        "14. Bảo Quản Quần Áo Đắt Tiền Luôn Chuẩn Form Spa",
        "Tránh Xa Máy Sấy Nhiệt Và Móc Treo Sắt Nhọn Hoắt Sần Xấu",
        "QUẢN TRỊ KHO ĐỒ",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=800&q=80",
        "Quần áo hàng hiệu may đo sẽ biến thành đống giẻ lau xơ xác vụn rách sờn mòn thê thảm nếu bạn tống bừa bãi vào máy giặt giật lực sấy nhiệt độ cao cực đoan hoang phí.",
        "Dùng túi giặt chuyên dụng cho đồ mỏng tơ lụa mềm mại dẻo dai, phơi ngang áo len trên sào phẳng tránh kéo chảy thòng xệ vai thòng sợi chỉ dài lêu nghêu sần ái ngại.",
        "Chăm chút yêu thương quần áo phản ánh trực diện nếp sống ngăn nắp tôn trọng bản thân rạng.",
        ["Sử dụng móc treo bằng gỗ dày bản múp tròn bo xoa vai áo vest chuẩn chỉ", "Cất kỹ dải túi hạt hút ẩm ẩm mốc mốc giữ tủ luôn khô râm thoáng mát thơm tho", "Đối với blazer len dạ bắt buộc giặt khô là hơi chuyên nghiệp sấy nhẹ bảo dưỡng"]
      ),
      s(
        "15. Bản Đồ 15 Món Đồ Vàng Sành Điệu Mọi Thời đại",
        "Cam Kết Biến Hình Thành Phiên Bản Tỏa Sáng Lộng Lẫy Nhất",
        "KẾT LUẬN THÔNG THÁI",
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80",
        `Chúc mừng đại mỹ nhân đã đi trọn dải 15 chương cẩm nang bí truyền thời trang sành điệu này do Fashionista ${authorName} hoàn thiện. Sự tự tin trong trang phục chính là chiếc vương miện lấp lánh nhất dồi dào.`,
        "Đừng rụt rè lo sợ định kiến phán xét của người đời đàm tiếu bên tai mông muội độc hại. Hãy kiêu hãnh thử nghiệm phong cách mới của bản thân ngày hôm nay.",
        "Búp hoa thời trang tự tin của bạn sẽ bung nở hương sắc rực rỡ dạt dào nhất Việt Nam rạng rỡ!",
        ["Nhấn in cẩm nang ra PDF lưu trữ làm nguồn tham cứu phối đồ bàn điểm sáng đẹp", "Tham gia cộng đồng sắc đẹp chia sẻ outfit hằng ngày rần rần dạt dào hội ý", "Quay vòng quay bốc thăm rinh dạt dào voucher mua sắm thời trang hiệu hời cực điểm"]
      )
    ];

      slides = [...slides, ...getExtraSlides('fashion_tips', authorName)];
  } else {
    // Dynamic generation under a suggested customized topic "custom"
    const customTitle = customTopicName || 'Tài Liệu Cẩm Nang Sáng Tạo Đa Dạng VIP';
    const suggestions = customTopicContentSuggested || 'Kinh doanh thông thái, phát triển tư duy đột phá';
    title = customTitle;
    category = 'Đề Xuất Quản Trị';
    slides = generateCustomSlides(customTitle, suggestions, authorName, length);
  }

  // Slice or expand predefined slides to match the exact requested length (10 - 30)
  if (topic !== 'custom') {
    if (slides.length > length) {
      slides = slides.slice(0, length);
    } else if (slides.length < length) {
      const extra = getExtraSlides(topic, authorName);
      slides = [...slides, ...extra].slice(0, length);
    }
  }

  return { title, category, slides };
}
