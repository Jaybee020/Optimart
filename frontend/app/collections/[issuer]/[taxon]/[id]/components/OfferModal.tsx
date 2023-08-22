"use client";

import {
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import dayjs from "dayjs";
import Image from "next/image";
import Calendar from "react-calendar";
import { useRef, useState } from "react";
import useClickOut from "@hooks/useClickOut";
import { useAccount } from "@contexts/AccountContext";

interface OfferModalProps {
  nftData: any;
  closeModal: () => void;
}

const doubleDigit = (val: number | string): string =>
  Number(val) >= 10 ? String(val) : "0" + val;

const OfferModal = ({ nftData, closeModal }: OfferModalProps) => {
  const calendarRef = useRef(null);
  const { account, makeOffer } = useAccount();

  const [qrpng, setQrpng] = useState("");
  const [amount, setAmount] = useState("1");
  const [openCalendar, setOpenCalendar] = useState(false);

  useClickOut([calendarRef], () => setOpenCalendar(false));

  const [dateVal, setDateVal] = useState(new Date());
  const [hour, setHour] = useState(doubleDigit(new Date().getHours()));
  const [minute, setMinute] = useState(doubleDigit(new Date().getMinutes()));

  const isToday = (activeDate: Date = dateVal): boolean => {
    const now = new Date();
    return (
      activeDate.getDate() === now.getDate() &&
      activeDate.getMonth() === now.getMonth()
    );
  };

  const updateDate = (newDate: Date, hr: number, min: number): void => {
    newDate.setHours(hr);
    newDate.setMinutes(min);
    setDateVal(newDate);
    setHour(doubleDigit(hr));
    setMinute(doubleDigit(min));
  };

  const handleHourChange = (value: string): void => {
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue > 23) return;

    const newDate = new Date(dateVal);
    const now = new Date();
    const hr = isToday()
      ? Math.max(numericValue, now.getHours())
      : numericValue;
    const min = isToday()
      ? Math.max(Number(minute), now.getMinutes())
      : Number(minute);

    updateDate(newDate, hr, min);
  };

  const handleMinChange = (value: string): void => {
    const numericValue = Number(value);
    if (isNaN(numericValue) || numericValue > 59) return;

    const newDate = new Date(dateVal);
    const now = new Date();
    const hr = isToday()
      ? Math.max(Number(hour), now.getHours())
      : Number(hour);
    const min = isToday()
      ? hr === now.getHours()
        ? Math.max(numericValue, now.getMinutes())
        : numericValue
      : numericValue;

    updateDate(newDate, hr, min);
  };

  const handleDateChange = (date: Date | null): void => {
    if (!date || isNaN(date.getTime())) return;

    const newDate = new Date(date);
    const now = new Date();
    const hr = isToday(newDate)
      ? Math.max(Number(hour), now.getHours())
      : Number(hour);
    const min = isToday(newDate)
      ? hr === now.getHours()
        ? Math.max(Number(minute), now.getMinutes())
        : Number(minute)
      : Number(minute);

    updateDate(newDate, hr, min);
  };

  return (
    <>
      <div className="app-modal__header">
        <h2>Make Offer</h2>
        <button className="close-modal-btn" onClick={closeModal}>
          <X size={20} strokeWidth={2.4} />
        </button>
      </div>

      {qrpng ? (
        <div className="qr-image__container">
          <p>
            Scan this QR code with your XUMM app to make an offer for this NFT.
          </p>

          <div className="qr-image">
            <Image
              alt="image"
              src={qrpng}
              width={350}
              height={350}
              className="qr-image"
            />
          </div>
        </div>
      ) : (
        <div className="offers-modal">
          <div className="item-block">
            <p className="title">Amount you want to offer</p>

            <input
              type="text"
              value={amount}
              placeholder="0"
              className="amount-input"
              onBlur={e => {
                if (e.target.value === "" || e.target.value === "0")
                  setAmount("1");
              }}
              onChange={e => {
                const value = parseInt(e.target.value);
                if (isNaN(value) && e.target.value) return;
                setAmount((e.target.value ? value : "") + "");
              }}
            />
          </div>

          <div className={`calendar-container ${openCalendar ? "open" : ""}`}>
            <p className="title">Expiration Date (Optional)</p>
            <p className="sub">Only future dates are allowed.</p>

            <div className="date-configs">
              <button
                className="option-select"
                onClick={e => setOpenCalendar(p => true)}
              >
                <p>{dayjs(dateVal).format("DD MMM, YYYY")}</p>
                <ChevronDown size={14.5} strokeWidth={2.4} />
              </button>

              <div className="time-inputs">
                <div className="option-select">
                  <input
                    min={0}
                    max={23}
                    type="number"
                    value={hour}
                    onBlur={e => handleHourChange(e.target.value)}
                    onChange={e =>
                      e.target.value.length < 3 &&
                      setHour(
                        (Number(e?.target?.value) > 23
                          ? 23
                          : Number(e?.target?.value) < 0
                          ? 0
                          : e.target.value
                        ).toString()
                      )
                    }
                  />
                </div>
                <p>:</p>
                <div className="option-select">
                  <input
                    min={0}
                    max={59}
                    type="number"
                    value={minute}
                    onBlur={e => handleMinChange(e.target.value)}
                    onChange={e =>
                      e.target.value.length < 3 &&
                      setMinute(
                        (Number(e?.target?.value) > 59
                          ? 59
                          : Number(e?.target?.value) < 0
                          ? 0
                          : e.target.value
                        ).toString()
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {openCalendar && (
              <div className="calendar-popup" ref={calendarRef}>
                <Calendar
                  minDetail="year"
                  value={dateVal}
                  minDate={new Date()}
                  prevLabel={<ChevronLeft size={15} strokeWidth={2.4} />}
                  prev2Label={<ChevronsLeft size={16} strokeWidth={2.4} />}
                  nextLabel={<ChevronRight size={15} strokeWidth={2.4} />}
                  next2Label={<ChevronsRight size={16} strokeWidth={2.4} />}
                  tileClassName={({ activeStartDate, date, view }) =>
                    view === "month" && date.getDay() === dateVal.getDay()
                      ? "active-tile"
                      : null
                  }
                  // @ts-ignore
                  onChange={handleDateChange}
                />
              </div>
            )}
          </div>

          <button
            className="submit-btn btn-primary"
            onClick={async () => {
              if (!account) return;
              if (amount === "" || amount === "0") return;

              const qrImage = await makeOffer({
                price: amount,
                expirationTime: dateVal,
                nftId: nftData?.token_identifier,
                sellerAddr: nftData?.owner?.address,
              });

              setQrpng(qrImage);
            }}
          >
            Submit
          </button>
        </div>
      )}
    </>
  );
};

export default OfferModal;
