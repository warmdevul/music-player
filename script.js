const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = "PLAYER"
const player = $('.player')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const button = $('.btn')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playlist = $('.playlist')
const volumeBar = $('.volume-bar')
const muteIcon = $('.icon-mute')
const unmuteIcon = $('.icon-unmute')
const audioDuration = $('.time-right')
const audioTimeLeft = $('.time-left')
const rangeValue = $('.range')
const cdProgressFull = $('.cd .circle .mask.full')
const cdProgressFill = $$('.cd .circle .mask .fill')
var r = $(':root');


const initialConfig = {
    isRandom: false,
    isRepeat: false,
    currentIndex: 0,
    isPlaying: false,
    currentVolume: 1,
    savedVolume: 1,
    progressSong: 0,
};
const storedConfig = JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY));

const app = {
    isRandom: false,
    isRepeat: false,
    currentIndex: 0,
    isPlaying: false,
    playedIndexes: [],
    currentVolume: 1,
    savedVolume: 1,
    progressSong: 0,
    config: storedConfig || initialConfig,
    setConfig: function (key, value) {
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
    },
    songs: [
        {
            name: 'Nấu Ăn Cho Em',
            singer: 'Đen, PiaLinh',
            path: './music/nauanchoem/nauanchoem.mp3',
            image: './music/nauanchoem/image.jpg'
        },
        {
            name: 'Đưa Nhau Đi Trốn',
            singer: 'Đen, Linh Cáo',
            path: './music/duanhauditron/duanhauditron.mp3',
            image: './music/duanhauditron/image.jpg'
        },
        {
            name: 'Mang Tiền Về Cho Mẹ',
            singer: 'Đen, Nguyên Thảo',
            path: './music/mangtienvechome/mangtienvechome.mp3',
            image: './music/mangtienvechome/image.jpg'
        },
        {
            name: 'Lối Nhỏ',
            singer: 'Đen, Phương Anh Đào',
            path: './music/loinho/loinho.mp3',
            image: './music/loinho/image.jpg'
        },
        {
            name: 'Đố Em Biết Anh Đang Nghĩ Gì',
            singer: 'Đen, JustaTee',
            path: './music/doembietanhdangnghigi/doembietanhdangnghigi.mp3',
            image: './music/doembietanhdangnghigi/image.jpg'
        },
        {
            name: 'Đi Về Nhà',
            singer: 'Đen, JustaTee',
            path: './music/divenha/divenha.mp3',
            image: './music/divenha/image.jpg'
        },
        {
            name: 'Trốn Tìm',
            singer: 'Đen, MTV band',
            path: './music/trontim/trontim.mp3',
            image: './music/trontim/image.jpg'
        },
        {
            name: 'Anh Đếch Cần Gì Nhiều Ngoài Em',
            singer: 'Đen, Vũ, Thành Đồng',
            path: './music/anhdechcanginhieungoaiem/anhdechcanginhieungoaiem.mp3',
            image: './music/anhdechcanginhieungoaiem/image.jpg'
        },
    ],
    render: function () {
        const htmls = this.songs.map((song, index) => {
            return `
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}" >
                <div class="thumb"
                    style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fa-solid fa-ellipsis"></i>
                </div>
            </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    definedProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex]
            }
        })
    },
    handleEvents: function () {
        const _this = this
        // Xử lý CD quay/dừng
        const cdWidth = cd.offsetWidth
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)' }
        ], {
            duration: 10000,
            iterations: Infinity,
        })
        cdThumbAnimate.pause()

        document.onscroll = function () {
            const scrollTop = document.documentElement.scrollTop
            // console.log(scrollTop)
            const newCdWidth = cdWidth - scrollTop
            // console.log(newCdWidth)
            r.style.setProperty('--cd-dim', newCdWidth + 'px');
            r.style.setProperty('--thumb-dim', Math.floor(newCdWidth * 94 / 100) + 'px');
            r.style.setProperty('--c-width', Math.floor(newCdWidth * 3 / 100) + 'px');
            cd.style.opacity = newCdWidth / cdWidth
        }
        // Xử lý khi click play
        playBtn.onmousedown = function () {

            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
            // Khi bài hát đc play
            audio.onplay = function () {
                _this.isPlaying = true
                player.classList.add('playing')
                cdThumbAnimate.play()
            }
            // Khi bài hát bị pause
            audio.onpause = function () {
                _this.isPlaying = false
                player.classList.remove('playing')
                cdThumbAnimate.pause()
            }
        }
        //Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function () {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
                _this.setConfig("progressSong", audio.currentTime)
                audioTimeLeft.innerHTML = _this.formatTime(audio.currentTime)
                var backgroundColor = 'linear-gradient(to right, var(--primary-color)' + progress.value + '% , rgb(214, 214, 214)' + progress.value + '%)';
                progress.style.background = backgroundColor;
            }
            // Xử lý khi tua
            progress.oninput = function (e) {
                const seekTime = audio.duration / 100 * e.target.value
                audio.currentTime = seekTime
            }
            ///cd Thumb complete percent
            const percent = progress.value / 100 * 180;
            // console.log(percent)
            cdProgressFull.style.transform = `rotate(${percent}deg)`;
            cdProgressFill.forEach(fillElement => {
                fillElement.style.transform = `rotate(${percent}deg)`;
            });
        }
        // Khi next song 
        nextBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.scrollToActiveSong()
        }
        // Khi prev song 
        prevBtn.onclick = function () {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.scrollToActiveSong()
        }
        // Xử lý lặp lại một song
        repeatBtn.onclick = function (e) {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)
        }
        // Xử lý bật/ tắt random song
        randomBtn.onclick = function (e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }
        //Xử lý next song khi audio end
        audio.onended = function () {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }
        // Lắng nghe hành vi click vào playlist

        playlist.onclick = function (e) {
            _this.progressSong = 0
            const songNode = e.target.closest('.song:not(.active)')

            if (songNode || e.target.closest('.option')) {
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    $('.song.active').classList.remove('active')
                    songNode.classList.add('active')
                    // if (!_this.isPlaying) {
                    player.classList.add('playing')
                    audio.play()
                    // }
                }
            }
        }

        //Xử lý khi click vào nút volume

        if (_this.currentVolume > 0) {
            volumeBar.value = _this.currentVolume
            audio.volume = _this.currentVolume
            $('.icon-unmute').style.visibility = 'visible'
            $('.icon-mute').style.visibility = 'hidden'
        } else {
            volumeBar.value = 0
            audio.volume = 0
            $('.icon-unmute').style.visibility = 'hidden'
            $('.icon-mute').style.visibility = 'visible'
        }
        audio.onvolumechange = () => {
            volumeBar.value = audio.volume
            if (audio.volume === 0) {
                muteIcon.style.visibility = 'visible'
                unmuteIcon.style.visibility = 'hidden'
            } else {
                muteIcon.style.visibility = 'hidden'
                unmuteIcon.style.visibility = 'visible'
            }
        }
        volumeBar.oninput = e => {
            this.setConfig("currentVolume", e.target.value)
            audio.volume = volumeBar.value
            volumeBar.setAttribute("title", "Âm lượng " + volumeBar.value * 100 + "%")
        }

        unmuteIcon.onclick = e => {
            this.setConfig("savedVolume", audio.volume)
            audio.volume = 0
            this.setConfig("currentVolume", audio.volume)
        }
        muteIcon.onclick = (e) => {
            audio.volume = this.config.savedVolume
            this.setConfig("currentVolume", audio.volume)
        }
    },

    scrollToActiveSong: function () {
        const song = $$('.song')
        var view = '';
        if (this.currentIndex <= 2) view = 'end';
        else view = 'center';
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: "smooth",
                block: view
            });
        }, 100);
    },

    loadCurrentSong: function () {
        this.setConfig("currentIndex", this.currentIndex)
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
        audio.onloadedmetadata = () => {
            audioDuration.innerHTML = this.formatTime(audio.duration)
            audio.currentTime = this.progressSong
        }
    },
    formatTime: function (seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        const formattedTime = `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
        return formattedTime;
    },
    loadConfig: function () {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
        this.currentIndex = this.config.currentIndex
        this.currentVolume = this.config.currentVolume
        this.progressSong = this.config.progressSong
    },
    nextSong: function () {
        this.currentIndex++
        this.progressSong = 0
        this.isPlaying = true
        player.classList.add('playing')
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
            this.setConfig('currentIndex', this.currentIndex)
        }
        $('.song.active').classList.remove('active')
        const songList = $$('.song')
        const song = songList[this.currentIndex]
        song.classList.add('active')
        this.loadCurrentSong()
    },
    prevSong: function () {
        this.currentIndex--
        this.progressSong = 0
        this.isPlaying = true
        player.classList.add('playing')
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1
        }
        $('.song.active').classList.remove('active')
        const songList = $$('.song')
        const song = songList[this.currentIndex]
        song.classList.add('active')
        this.loadCurrentSong()
    },
    playRandomSong: function () {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (this.playedIndexes.includes(newIndex))

        this.playedIndexes.push(newIndex)
        console.log(this.playedIndexes)
        if (this.playedIndexes.length === this.songs.length) {
            this.playedIndexes = []
        }
        this.currentIndex = newIndex
        this.progressSong = 0
        this.isPlaying = true
        player.classList.add('playing')
        $('.song.active').classList.remove('active')
        const songList = $$('.song')
        const song = songList[this.currentIndex]
        song.classList.add('active')
        this.loadCurrentSong()
    },
    start: function () {
        this.progressSong = 0
        //Gán cấu hình vào ứng dụng
        this.loadConfig()

        this.definedProperties()

        this.handleEvents()

        this.loadCurrentSong()

        this.render()

        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}
app.start()