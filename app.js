function createMatrix() {
    const cityCount = parseInt(document.getElementById('cityCount').value);
    const container = document.getElementById('matrixContainer');
    container.innerHTML = ''; 

    if (isNaN(cityCount) || cityCount <= 0) {
        alert('Vui lòng nhập số thành phố hợp lệ!');
        return;
    }

    // Thiết lập ma trận dạng lưới
    container.style.gridTemplateColumns = `repeat(${cityCount}, auto)`;
    container.style.gridTemplateRows = `repeat(${cityCount}, auto)`;

    for (let i = 0; i < cityCount; i++) {
        for (let j = 0; j < cityCount; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.dataset.row = i;
            input.dataset.col = j;
            input.style.textAlign = 'center'; // Canh giữa chữ số

            if (i === j) {
                // Nếu là đường chéo chính, đặt giá trị mặc định là 0 và không cho phép chỉnh sửa
                input.value = 0;
                input.readOnly = true; // Không cho phép người dùng chỉnh sửa
                input.style.backgroundColor = "#f0f0f0"; // Đổi màu nền để dễ nhận biết
            } else {
                input.addEventListener('input', updateSymmetric);
            }

            container.appendChild(input);
        }
    }
}

function updateSymmetric(event) {
    const input = event.target;
    const row = parseInt(input.dataset.row);
    const col = parseInt(input.dataset.col);
    const value = input.value;

    if (!value || isNaN(value)) return;

    // Cập nhật giá trị đối xứng
    const symmetricInput = document.querySelector(`input[data-row="${col}"][data-col="${row}"]`);
    if (symmetricInput) {
        symmetricInput.value = value;
    }

    // Điều chỉnh kích thước các ô dựa trên giá trị nhập vào
    adjustInputSize();
}

function adjustInputSize() {
    const inputs = document.querySelectorAll('#matrixContainer input');
    let maxLength = 1;

    // Tìm số có độ dài lớn nhất
    inputs.forEach(input => {
        const value = input.value;
        if (value && value.length > maxLength) {
            maxLength = value.length;
        }
    });

    // Cập nhật chiều rộng của các ô dựa trên số chữ số lớn nhất
    const newWidth = `${maxLength * 10 + 20}px`; // Tăng kích thước ô dựa trên số chữ số
    inputs.forEach(input => {
        input.style.width = newWidth;
    });
}

function submitMatrix() {
    const matrixContainer = document.getElementById('matrixContainer');
    const inputs = matrixContainer.getElementsByTagName('input');
    const cityCount = Math.sqrt(inputs.length);
    const maTranKhoangCach = Array.from({ length: cityCount }, () => Array(cityCount).fill(0));

    for (const input of inputs) {
        const row = parseInt(input.dataset.row);
        const col = parseInt(input.dataset.col);
        const value = parseInt(input.value);

        maTranKhoangCach[row][col] = value;
    }

    console.log('Ma trận khoảng cách:', maTranKhoangCach);


    const duongDiBatDau = Array.from({ length: cityCount }, (_, i) => i);
    const { duongDi, khoangCach } = leoDoiDocTSP(maTranKhoangCach, duongDiBatDau);

    document.getElementById('optimalRoute').textContent = duongDi.join(' -> ');
    document.getElementById('optimalDistance').textContent = khoangCach;
}

// Hàm để tính tổng khoảng cách của một tuyến đường
function tinhTongKhoangCach(route, maTranKhoangCach) {
    return route.reduce((total, current, index) => {
        const next = (index + 1) % route.length;
        return total + maTranKhoangCach[current][route[next]];
    }, 0);
}

// Hàm để hoán đổi hai thành phố trong tuyến đường
function hoanDoiHaiThanhPho(route) {
    const routeMoi = [...route];
    const [i, j] = [Math.floor(Math.random() * route.length), Math.floor(Math.random() * route.length)];
    [routeMoi[i], routeMoi[j]] = [routeMoi[j], routeMoi[i]];
    return routeMoi;
}

// Hàm để thực hiện thuật toán Leo Đồi Dốc Đứng
function leoDoiDocTSP(maTranKhoangCach, duongDiBatDau) {
    let duongDiHienTai = duongDiBatDau;
    let khoangCachHienTai = tinhTongKhoangCach(duongDiHienTai, maTranKhoangCach);
    
    while (true) {
        let duongDiTotNhat = null;
        let khoangCachTotNhat = khoangCachHienTai;

        // Tìm tất cả các lân cận (neighbor)
        for (let i = 0; i < duongDiHienTai.length; i++) {
            const duongDiMoi = hoanDoiHaiThanhPho(duongDiHienTai);
            const khoangCachMoi = tinhTongKhoangCach(duongDiMoi, maTranKhoangCach);

            // So sánh khoảng cách của tuyến đường mới với tuyến đường tốt nhất hiện tại
            if (khoangCachMoi < khoangCachTotNhat) {
                duongDiTotNhat = duongDiMoi;
                khoangCachTotNhat = khoangCachMoi;
            }
        }

        // Nếu không tìm được tuyến đường nào tốt hơn, kết thúc thuật toán
        if (duongDiTotNhat === null) break;

        // Nếu tìm được tuyến đường tốt hơn, cập nhật tuyến đường hiện tại
        duongDiHienTai = duongDiTotNhat;
        khoangCachHienTai = khoangCachTotNhat;
    }
    
    return { duongDi: duongDiHienTai, khoangCach: khoangCachHienTai };
}

